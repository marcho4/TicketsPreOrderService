use actix_web::{get, web, HttpResponse};
use actix_web::http::StatusCode;
use serde::Deserialize;
use crate::models::general::ApiResponse;
use crate::models::tickets::Ticket;
use crate::models::tickets::TicketStatus::Available;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;

#[derive(Deserialize)]
pub struct TicketsQuery {
    available: Option<bool>,
}


#[utoipa::path(
    get,
    path = "/api/tickets/{match_id}",
    tag = "Tickets",
    description = "Get available tickets for a match",
    summary = "Получить данные о билетах для конкретного матча",
    params(
        ("match_id" = String, Path, description = "Unique match ID"),
    ),
    responses(
        (status = 200, description = "Successfully found", body = ApiResponse<Vec<Ticket>>),
        (status = 500, description = "Error", body = ApiResponse<String>)
    )
)]
#[get("/{match_id}")]
pub async fn get_available_tickets(
    match_id: web::Path<String>,
    query: web::Query<TicketsQuery>,
    orchestrator: web::Data<Orchestrator>,
) -> HttpResponse {
    let match_id = match_id.into_inner();
    let available = query.available.unwrap_or(false);

    let tickets = match orchestrator.get_match_tickets(match_id).await {
        Ok(t) => t,
        Err(e) => {
            return generic_response::<String>(
                StatusCode::INTERNAL_SERVER_ERROR,
                Some(e.to_string()),
                None,
            );
        }
    };

    let mut tickets_list = tickets;
    if available {
        tickets_list.retain(|ticket| ticket.status == Available);
    }

    generic_response::<Vec<Ticket>>(
        StatusCode::OK,
        Some("Successfully accomplished!".to_string()),
        Some(tickets_list),
    )
}