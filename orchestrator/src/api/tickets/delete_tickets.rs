use actix_web::{delete, web, HttpRequest, HttpResponse};
use actix_web::http::StatusCode;
use serde_json::json;
use crate::models::delete_tickets::{DeleteTickets, DeleteTicketsResp};
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::request_validator::RequestValidator;
use crate::utils::responses::generic_response;


#[utoipa::path(
    delete,
    path = "/api/tickets/{match_id}",
    description = "Delete tickets by Ticket's IDs list",
    tag = "Tickets",

)]
#[delete("/{match_id}")]
pub async fn delete_tickets(
    tickets: web::Json<DeleteTickets>,
    orchestrator: web::Data<Orchestrator>,
    match_id: web::Path<String>,
    req: HttpRequest,
) -> HttpResponse {
    let match_id = match_id.into_inner();
    let match_id_owner = orchestrator.get_match(&match_id).await
        .map_err(|e|  HttpResponse::InternalServerError().json(json!({
            "msg":e.to_string()
        })));

    if let Err(e) = match_id_owner {
        return e;
    };

    let match_id_owner = match_id_owner.unwrap().organizer_id;

    if let Err(e) = RequestValidator::check_user(&req, match_id_owner) {
        return e;
    };

    let res = orchestrator.delete_tickets(match_id, tickets.into_inner()).await;
    if let Err(e) = &res {
        return generic_response::<String>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some("Internal Server Error".to_string()),
            Some(e.to_string()),
        )
    };
    let res = res.unwrap();

    generic_response::<DeleteTicketsResp>(
        StatusCode::OK,
        Some("Successfully accomplished!".to_string()),
        Some(res),
    )
}