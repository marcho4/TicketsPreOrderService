use actix_web::{get, web, Responder};
use actix_web::http::StatusCode;
use crate::models::api_response::ApiResponse;
use crate::models::matches::Match;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;


#[utoipa::path(
    get,
    path = "/api/matches/{match_id}",
    tag = "Matches",
    description = "Get match info",
    summary = "Получить информацию о матче",
    params(
        ("match_id" = String, Path, description = "Уникальный идентификатор матча"),
    ),
    responses(
        (status = 200, description = "Successfully found", body = ApiResponse<Match>),
        (status = 500, description = "Error", body = ApiResponse<String>)
    )
)]
#[get("/{match_id}")]
pub async fn get_match(match_id: web::Path<String>, orchestrator: web::Data<Orchestrator>) -> impl Responder {
    match orchestrator.get_match(&match_id.into_inner()).await {
        Ok(matches) => {
            generic_response::<Match>(StatusCode::OK, Some("Success".into()), Some(matches))
        },
        Err(e) => {
            generic_response::<String>(StatusCode::INTERNAL_SERVER_ERROR, Some("Error".into()), Option::from(e.to_string()))
        }
    }
}