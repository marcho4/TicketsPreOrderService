use crate::models::create_org_data::CreateOrgData;
use crate::models::org_approve_body::OrgApproveBody;
use crate::models::org_approve_response::OrgApproveResponse;
use crate::models::request_process_info::{RequestProcessInfo, Status};
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;
use actix_web::{post, web, HttpResponse};
use actix_web::http::StatusCode;
use log::info;
use crate::utils::errors::OrchestratorError;

#[post("/process")]
pub async fn process_request(
    data: web::Json<RequestProcessInfo>,
    orchestrator: web::Data<Orchestrator>,
) -> HttpResponse {
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
        Ok(org) => org.data.id,
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
        user_id: org_id,
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

    generic_response::<OrgApproveResponse>(
        StatusCode::OK,
        Some("Successfully approved org".to_string()),
        Some(org_approve_response),
    )
}