use actix_web::{put, web, Responder};
use actix_web::http::StatusCode;
use crate::models::api_response::ApiResponse;
use crate::models::matches::{Match, UpdateMatchData};
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;

#[utoipa::path(
    put,
    path = "/api/matches/{match_id}",
    tag = "Matches",
    description = "Update match info",
    summary = "Обновить данные матч",
    params(
        ("match_id" = String, Path, description = "Уникальный идентификатор матча")
    ),
    request_body = UpdateMatchData,
    responses(
        (status = 200, description = "Successfully updated", body = ApiResponse<Match>),
        (status = 500, description = "Error", body = ApiResponse<String>)
    )
)]
#[put("/{match_id}")]
pub async fn update_match(
    orchestrator: web::Data<Orchestrator>,
    match_id: web::Path<String>,
    data: web::Json<UpdateMatchData>
) -> impl Responder {
    let data = data.into_inner();
    let match_id = match_id.into_inner();
    match orchestrator.update_match(match_id, data).await {
        Ok(matches) => {
            generic_response::<Match>(StatusCode::OK, Some("Success".into()), Some(matches))
        },
        Err(e) => {
            generic_response::<String>(StatusCode::INTERNAL_SERVER_ERROR, Some("Error".into()), Option::from(e.to_string()))
        }
    }
}