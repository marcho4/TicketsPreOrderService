use actix_web::{get, web, HttpRequest, HttpResponse};
use actix_web::http::StatusCode;
use crate::models::general::ApiResponse;
use crate::models::tickets::Ticket;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::request_validator::RequestValidator;
use crate::utils::responses::generic_response;


#[utoipa::path(
    get,
    path = "/api/tickets/ticket/{id}",
    tag = "Tickets",
    summary = "Получить данные о билете",
    description = "Получить данные о билете по ID",
    params(
        ("id" = String, Path, description = "ID of the ticket")
    ),
    responses(
        (status = 200, description = "Successfully got information", body = ApiResponse<Ticket>),
        (status = 403, description = "Forbidden: Access restricted due to missing or invalid credentials, wrong role, or mismatched user id"),
        (status = 500, description = "Internal Server Error", body=ApiResponse<String>)
    )
)]
#[get("/ticket/{id}")]
pub async fn get_ticket(
    req: HttpRequest,
    orchestrator: web::Data<Orchestrator>,
    id: web::Path<String>,
) -> HttpResponse {
    let id = id.into_inner();
    let ticket = orchestrator.get_ticket(id).await;
    println!("{:?}", ticket);
    match ticket {
        Ok(ticket) => {
            let validation = RequestValidator::check_user(&req, ticket.user_id.clone());
            if let Err(e) = validation {
                return e;
            };
            generic_response::<Ticket>(
                StatusCode::OK,
                Some("Успешно".to_string()),
                Some(ticket)
            )
        },
        Err(e) => generic_response::<String>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(String::from("Ошибка при получении данных")),
            Some(e.to_string()),
        ),
    }

}