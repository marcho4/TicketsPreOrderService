use std::collections::HashMap;
use actix_web::{put, web, HttpMessage, HttpRequest, HttpResponse};
use actix_web::http::StatusCode;
use chrono::{Datelike, Utc};
use serde_json::json;
use crate::models::api_response::ApiResponse;
use crate::models::email::{EmailTemplates, Recipient};
use crate::models::jwt_claims::JwtClaims;
use crate::models::message_resp::MessageResp;
use crate::models::roles::Role;
use crate::models::tickets::TicketReservation;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::request_validator::RequestValidator;
use crate::utils::responses::generic_response;

#[utoipa::path(
    put,
    path = "/api/tickets/preorder/{ticket_id}",
    tag = "Tickets",
    summary = "Preorder concrete ticket",
    description = "Preorder concrete ticket",
    params(
        ("ticket_id" = String, Path, description = "ID of the ticket to preorder")
    ),
    responses(
        (status = 200, description = "Successfully cancelled preorder", body = ApiResponse<MessageResp>),
        (status = 403, description = "Forbidden: Access restricted due to missing or invalid credentials, wrong role, or mismatched user id"),
        (status = 500, description = "Internal Server Error", body=ApiResponse<String>)
    )
)]
#[put("/preorder/{ticket_id}")]
pub async fn preorder_ticket(
    req: HttpRequest,
    orchestrator: web::Data<Orchestrator>,
    ticket_id: web::Path<String>,
    reservation_data: web::Json<TicketReservation>
) -> HttpResponse {
    let ticket_id = ticket_id.into_inner();

    let validation = RequestValidator::validate_req(&req, Role::USER, None);

    if let Err(e) = validation {
        return e;
    }

    let mut data = reservation_data.into_inner();

    let binding = req.extensions();
    let jwt_claims = binding.get::<JwtClaims>().ok_or_else(|| {
        generic_response::<String>(
            StatusCode::FORBIDDEN,
            Some("Access restricted. You have to login first.".to_string()),
            None,
        )
    });

    if let Err(e) = jwt_claims {
        return e;
    }

    let jwt_claims = jwt_claims.unwrap();

    let user_id = &jwt_claims.user_id;
    data.user_id = user_id.clone();

    let user_info = orchestrator.get_user(user_id.clone()).await;

    match orchestrator.reserve_ticket(&ticket_id, data).await {
        Ok(ticket) => {

            if let Ok(user_info) = user_info {

                let mut variables : HashMap<String, serde_json::Value> = HashMap::new();

                variables.insert("user_name".to_string(), json!(user_info.name.clone()));
                variables.insert("logo_url".to_string(), json!("www.example.com/logo.png"));
                // variables.insert("match_title".to_string(), json!());
                // variables.insert("match_date".to_string(), json!());
                // variables.insert("match_time".to_string(), json!());
                // variables.insert("stadium".to_string(), json!());
                variables.insert("order_details_url".to_string(), json!("http://localhost:3000/dashboard"));
                variables.insert("order_id".to_string(), json!(ticket_id));
                variables.insert("service_name".to_string(), json!("Tickets PreOrder Platform"));
                variables.insert("current_year".to_string(), json!(Utc::now().year()));
                variables.insert("company_name".to_string(), json!("Tickets PreOrder Platform"));
                let email_res = orchestrator.send_email(
                    EmailTemplates::TicketPreOrder,
                    Recipient{
                        name: user_info.name.clone(),
                        email: user_info.email.clone()
                    },
                    variables,
                    None
                ).await;

            }


            generic_response::<MessageResp>(
                StatusCode::OK,
                Some("Success".to_string()),
                Some(ticket))
        }
        Err(e) => generic_response::<MessageResp>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(e.to_string()),
            None
        )
    }
}