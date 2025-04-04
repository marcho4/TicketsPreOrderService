use actix_web::{post, web, HttpRequest, HttpResponse};
use actix_web::http::StatusCode;
use log::info;
use crate::models::queue_models::{QueueAdd, QueueModel};
use crate::models::roles::Role;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::request_validator::RequestValidator;
use crate::utils::responses::generic_response;

#[utoipa::path(
    post,
    path = "/api/matches/queue/{match_id}",
    tag = "Matches",
    summary = "Встать в очередь",
    request_body = QueueAdd,
    params(
        ("match_id" = String, Path, description = "Уникальный идентификатор матча.")
    ),
    responses(
        (status = 200, description = "Вы встали в очередь"),
        (status = 500, description = "Внутренняя ошибка сервера")
    )
)]
#[post("/queue/{match_id}")]
pub async fn add_user_to_queue(
    req: HttpRequest,
    orchestrator: web::Data<Orchestrator>,
    match_id: web::Path<String>,
    data: web::Json<QueueAdd>,
) -> HttpResponse {
    // Валидация запроса
    if let Err(e) = RequestValidator::validate_req(&req, Role::USER, None) {
        return e;
    }

    let match_id = match_id.into_inner();

    // На этом моменте юзер точно залогинен из-за валидации сверху
    let user_id = RequestValidator::get_user_id(&req).unwrap();
    let email = orchestrator.get_user(user_id.clone()).await.unwrap().email;

    let queue_model = QueueModel {
        user_id,
        min_price: data.min_price,
        max_price: data.max_price,
        email,
    };

    info!("Add user to queue: {:?}", &match_id);
    info!("{:?}", &queue_model);
    let res = orchestrator.add_to_queue(match_id, queue_model).await;
    match res {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(e) => generic_response::<String>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(format!("Failed to add user to queue: {}", e)),
            None
        )
    }
}
