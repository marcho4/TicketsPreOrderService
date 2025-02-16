use actix_web::{put, web, HttpRequest, HttpResponse};
use actix_web::http::StatusCode;
use crate::models::message_resp::MessageResp;
use crate::models::roles::Role;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::request_validator::RequestValidator;
use crate::utils::responses::generic_response;

#[put("/preorder/{ticket_id}")]
pub async fn preorder_ticket(
    req: HttpRequest,
    orchestrator: web::Data<Orchestrator>,
    ticket_id: web::Path<String>,
) -> HttpResponse {
    let ticket_id = ticket_id.into_inner();

    let validation = RequestValidator::validate_req(&req, Role::USER, None);

    if let Err(e) = validation {
        return e;
    }

    match orchestrator.reserve_ticket(&ticket_id).await {
        Ok(ticket) => generic_response::<MessageResp>(
            StatusCode::OK,
            Some("Success".to_string()),
            Some(ticket)
        ),
        Err(e) => generic_response::<MessageResp>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(e.to_string()),
            None
        )
    }
}