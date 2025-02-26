use std::collections::HashMap;
use actix_web::{put, web, HttpRequest, HttpResponse};
use actix_web::http::StatusCode;
use chrono::{Datelike, Utc};
use serde_json::json;
use crate::models::api_response::ApiResponse;
use crate::models::email::{EmailTemplates, Recipient};
use crate::models::message_resp::MessageResp;
use crate::models::roles::Role;
use crate::models::tickets::CancelData;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::request_validator::RequestValidator;
use crate::utils::responses::generic_response;


#[utoipa::path(
    put,
    path = "/api/tickets/cancel/{ticket_id}",
    tag = "Tickets",
    summary = "Cancels preorder of the concrete ticket",
    description = "Cancels preorder of the concrete ticket",
    request_body = CancelData,
    params(
        ("ticket_id" = String, Path, description = "ID of the ticket to cancel preorder")
    ),
    responses(
        (status = 200, description = "Successfully cancelled preorder", body = ApiResponse<MessageResp>),
        (status = 403, description = "Forbidden: Access restricted due to missing or invalid credentials, wrong role, or mismatched user id"),
        (status = 500, description = "Internal Server Error", body=ApiResponse<String>)
    )
)]
#[put("/cancel/{ticket_id}")]
pub async fn cancel_preorder(
    req: HttpRequest,
    ticket_id: web::Path<String>,
    orchestrator: web::Data<Orchestrator>,
    cancel_data: web::Json<CancelData>
) -> HttpResponse {
    let ticket_id = ticket_id.into_inner();
    let cancel_data = cancel_data.into_inner();

    let validation = RequestValidator::validate_req(&req, Role::USER,
                                                    Some(cancel_data.user_id.as_str()));

    if let Err(e) = validation {
        return e;
    }
    let user_id = cancel_data.user_id.clone();

    let users_tickets = match orchestrator
        .get_users_tickets(cancel_data.user_id).await {
        Ok(v) => v,
        Err(e) => {
            return generic_response::<String>(
                StatusCode::INTERNAL_SERVER_ERROR,
                Some(e.to_string()),
                None
            )
        }
    };

    // Если нет билета с id, которое
    if !users_tickets.iter().find(|ticket|
        ticket.user_id == user_id && ticket.id == ticket_id
    ).is_some() {
         return generic_response::<String>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some("You do not have the ticket with this id".to_string()),
            None
        )
    };

    match orchestrator.cancel_preorder(ticket_id.clone()).await {
        Ok(resp) => {

            let user_info = orchestrator.get_user(user_id.clone()).await;
            if let Ok(user_info) = user_info {

                let mut variables : HashMap<String, serde_json::Value> = HashMap::new();

                variables.insert("user_name".to_string(), json!(user_info.name.clone()));
                variables.insert("logo_url".to_string(), json!("www.example.com/logo.png"));
                // variables.insert("match_title".to_string(), json!());
                // variables.insert("match_date".to_string(), json!());
                // variables.insert("match_time".to_string(), json!());
                variables.insert("order_id".to_string(), json!(ticket_id));
                variables.insert("cancel_date".to_string(), json!(Utc::now().format("%Y-%m-%d %H:%M:%S").to_string()));
                variables.insert("service_name".to_string(), json!("Tickets PreOrder Platform"));
                variables.insert("current_year".to_string(), json!(Utc::now().year()));
                variables.insert("company_name".to_string(), json!("Tickets PreOrder Platform"));
                let email_res = orchestrator.send_email(
                    EmailTemplates::TicketPreOrderCancel,
                    Recipient {
                        email: user_info.email.clone(),
                        name: user_info.name.clone()
                    },
                    variables,
                    None
                );
            }


            generic_response::<MessageResp>(
                StatusCode::OK,
                Some("Successfully cancelled preorder".to_string()),
                Some(resp)
            )
        },
        Err(e) => generic_response::<String>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(e.to_string()),
            None
        )
    }
}