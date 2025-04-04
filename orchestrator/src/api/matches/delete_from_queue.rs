use actix_web::{delete, web, HttpRequest, HttpResponse};
use actix_web::http::StatusCode;
use crate::models::roles::Role;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::request_validator::RequestValidator;
use crate::utils::responses::generic_response;


#[utoipa::path(
    delete,
    path = "/api/matches/queue/{match_id}",
    tag = "Matches",
    summary = "Выйти из очередь",
    params(
        ("match_id" = String, Path, description = "Уникальный идентификатор матча.")
    ),
    responses(
        (status = 200, description = "Вы вышли из очереди"),
        (status = 500, description = "Внутренняя ошибка сервера")
    )
)]
#[delete("/queue/delete/{match_id}")]
pub async fn delete_from_queue(
    req: HttpRequest,
    orchestrator: web::Data<Orchestrator>,
    match_id: web::Path<String>,
) -> HttpResponse {
    // Валидация запроса
    if let Err(e) = RequestValidator::validate_req(&req, Role::USER, None) {
        return e;
    }

    let user_id = RequestValidator::get_user_id(&req).unwrap();
    let match_id = match_id.into_inner();

    let res = orchestrator.delete_from_queue(match_id, user_id).await;
    match res {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(e) => generic_response::<String>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(format!("Failed to delete from the queue: {}", e)),
            None
        )
    }
}
