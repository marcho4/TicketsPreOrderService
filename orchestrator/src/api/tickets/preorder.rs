use actix_web::{put, web, HttpRequest, HttpResponse};
use actix_web::http::StatusCode;
use crate::models::api_response::ApiResponse;
use crate::models::message_resp::MessageResp;
use crate::models::roles::Role;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::request_validator::RequestValidator;
use crate::utils::responses::generic_response;

#[utoipa::path(
    put,
    path = "/tickets/preorder/{ticket_id}",
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