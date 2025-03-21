use std::collections::HashMap;
use actix_web::{http::StatusCode, post, web, HttpRequest, HttpResponse};
use chrono::{Datelike, Utc};
use log::{error, info};
use serde_json::json;
use crate::models::{
    create_org_data::CreateOrgData,
    org_approve_body::OrgApproveBody,
    org_approve_response::OrgApproveResponse,
    request_process_info::{RequestProcessInfo, Status},
};
use crate::models::api_response::ApiResponse;
use crate::models::email::{EmailTemplates, Recipient};
use crate::models::roles::Role;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;
use crate::utils::errors::OrchestratorError;
use crate::utils::request_validator::RequestValidator;

#[utoipa::path(
    post,
    path = "/api/admin/process",
    summary = "Обработать заявку на регистрацию организатора",
    responses(
        (status = 200, description = "Successfully fetched requests", body = ApiResponse<OrgApproveResponse>),
        (status = 404, description = "Admin request not found", body = ApiResponse<String>),
        (status = 500, description = "Internal server error", body = ApiResponse<String>)
    ),
    tag = "Admin"
)]
#[post("/process")]
pub async fn process_request(
    data: web::Json<RequestProcessInfo>,
    orchestrator: web::Data<Orchestrator>,
    req: HttpRequest,
) -> HttpResponse {
    let validation = RequestValidator::validate_req(&req, Role::ADMIN, None);

    if let Err(e) = validation {
        return e;
    }

    let json_body = data.into_inner();
    info!("Processing request {}", json_body.request_id);

    let requests = match orchestrator.get_admin_requests().await {
        Ok(reqs) => reqs,
        Err(e) => {
            return generic_response::<String>(
                StatusCode::INTERNAL_SERVER_ERROR,
                Some(e.to_string()),
                None,
            )
        }
    };

    let request_info = match requests.iter().find(|r| r.request_id == json_body.request_id) {
        Some(r) => r,
        None => {
            return generic_response::<String>(
                StatusCode::NOT_FOUND,
                Some("Admin request with such ID was not found".to_string()),
                None,
            )
        }
    };

    if let Err(e) = orchestrator.process_organizer(&json_body).await {
        return match e {
            OrchestratorError::Deserialize(msg) => generic_response::<String>(
                StatusCode::BAD_REQUEST,
                Some("Error deserializing request".to_string()),
                Some(msg.to_string()),
            ),
            _ => generic_response::<String>(
                StatusCode::INTERNAL_SERVER_ERROR,
                Some(e.to_string()),
                None,
            ),
        };
    }

    if json_body.status == Status::REJECTED {
        return generic_response::<String>(
            StatusCode::OK,
            Some("Successfully rejected the request".to_string()),
            None,
        );
    }

    let org_data = CreateOrgData {
        email: request_info.email.clone(),
        tin: request_info.tin.clone(),
        organization_name: request_info.company.clone(),
    };

    let org_id = match orchestrator.create_organizer(org_data).await {
        Ok(org) => org,
        Err(e) => {
            return generic_response::<String>(
                StatusCode::INTERNAL_SERVER_ERROR,
                Some(e.to_string()),
                None,
            );
        }
    };

    let approve_payload = OrgApproveBody {
        email: request_info.email.clone(),
        company: request_info.company.clone(),
        tin: request_info.tin.clone(),
        status: "APPROVED".to_string(),
        user_id: org_id.data.id,
    };

    let org_approve_response = match orchestrator.org_approve(&approve_payload).await {
        Ok(resp) => resp,
        Err(e) => {
            return generic_response::<String>(
                StatusCode::INTERNAL_SERVER_ERROR,
                Some(e.to_string()),
                None,
            );
        }
    };


    let mut variables: HashMap<String, serde_json::Value> = HashMap::new();
    variables.insert("logo_url".to_string(), json!("https://example.com/logo.png"));
    variables.insert("company_name".to_string(), json!(request_info.company.clone()));
    variables.insert("service_name".to_string(), json!("Tickets PreOrder Platform"));
    variables.insert("current_year".to_string(), json!(Utc::now().year()));
    variables.insert("login".to_string(), json!(org_approve_response.login.clone()));
    variables.insert("password".to_string(), json!(org_approve_response.password.clone()));
    variables.insert("registration_date".to_string(), json!(Utc::now().to_string()));
    variables.insert("admin_panel_url".to_string(), json!("http://localhost:3000/organizer"));



    let email_res = orchestrator.send_email(
        EmailTemplates::OrganizerApproval,
        Recipient {
            name: request_info.company.clone(),
            email: request_info.email.clone(),
        },
        variables,
        None
    ).await;

    if let Err(e) = email_res {
        error!("{:?}", e.to_string());
    };


    generic_response::<OrgApproveResponse>(
        StatusCode::OK,
        Some("Successfully approved org".to_string()),
        Some(org_approve_response),
    )
}