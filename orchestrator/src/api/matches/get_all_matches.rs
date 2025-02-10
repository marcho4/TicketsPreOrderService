use actix_web::{get, web, Responder};
use actix_web::http::StatusCode;
use crate::models::api_response::ApiResponse;
use crate::models::matches::Match;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;


#[utoipa::path(
    get,
    path = "/api/matches/all",
    operation_id = "getAllMatches",
    tag = "Matches",
    summary = "Получить все созданные матчи",
    description = "Эндпоинт для получения списка всех матчей.  При успешном создании возвращается список с HTTP статусом 200. В случае ошибки возвращается сообщение об ошибке с HTTP статусом 500.",
    responses(
        (status = 200,
         description = "Успешно получили все матчи",
         body = ApiResponse<Vec<Match>>
        ),
        (status = 500,
         description = "Внутренняя ошибка сервера",
         body = ApiResponse<String>
        )
    )
)]
#[get("/all")]
pub async fn get_all_matches(orchestrator: web::Data<Orchestrator>) -> impl Responder {
    match orchestrator.get_all_matches().await {
        Ok(results) => {
            generic_response::<Vec<Match>>(StatusCode::OK, Some("Successfully parsed".into()), Some(results))
        },
        Err(e) => generic_response::<String>(StatusCode::INTERNAL_SERVER_ERROR,
                                             None, Some(e.to_string()))
    }
}