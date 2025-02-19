use actix_web::{get, web, HttpRequest, HttpResponse};
use actix_web::http::StatusCode;
use crate::models::api_response::ApiResponse;
use crate::models::roles::Role;
use crate::models::tickets::Ticket;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::request_validator::RequestValidator;
use crate::utils::responses::generic_response;

#[utoipa::path(
    get,
    path = "/api/tickets/user/{user_id}",
    tag = "Tickets",
    description = "Get available tickets for a concrete user",
    summary = "Получить данные о билетах для конкретного пользователя",
    params(
        ("user_id" = String, Path, description = "Unique user ID"),
    ),
    responses(
        (status = 200, description = "Successfully found", body = ApiResponse<Vec<Ticket>>),
        (status = 500, description = "Error", body = ApiResponse<String>)
    )
)]
#[get("/user/{user_id}")]
pub async fn get_tickets_by_user(
    user_id: web::Path<String>,
    orchestrator: web::Data<Orchestrator>,
    req: HttpRequest
) -> HttpResponse {
    let user_id = user_id.into_inner();

    let validation = RequestValidator::validate_req(&req, Role::USER,
                                                    Some(user_id.as_str()));

    if let Err(e) = validation {
        return e;
    }

    let tickets = match orchestrator.get_users_tickets(user_id).await {
        Ok(t) => t,
        Err(e) => {
            return generic_response::<String>(
                StatusCode::INTERNAL_SERVER_ERROR,
                Some(e.to_string()),
                None,
            );
        }
    };

    generic_response::<Vec<Ticket>>(
        StatusCode::OK,
        Some("Successfully accomplished!".to_string()),
        Some(tickets),
    )
}