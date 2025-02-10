use actix_web::{post, web, Responder};
use actix_web::http::StatusCode;
use crate::models::api_response::ApiResponse;
use crate::models::matches::CreateMatchData;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;


#[utoipa::path(
    post,
    path = "/api/matches/{org_id}",
    tag = "Matches",
    summary = "Создать новый матч",
    request_body = CreateMatchData,
    params(
        ("org_id" = String, Path, description = "Уникальный идентификатор организатора, для которого создаётся матч.")
    ),
    responses(
        (status = 201,
         description = "Матч успешно создан",
         body = ApiResponse<CreateMatchData>,
         example = json!({
             "id": "match_123",
             "organizer_id": "org_456",
             "title": "Финал чемпионата",
             "date": "2025-05-01T15:30:00Z"
         })
        ),
        (status = 500,
         description = "Внутренняя ошибка сервера",
         body = ApiResponse<String>,
         example = json!({
             "msg": "Error",
             "data": "Some error"
         })
        )
    )
)]
#[post("/{org_id}")]
pub async fn create_match(
    data: web::Json<CreateMatchData>,
    orchestrator: web::Data<Orchestrator>,
    org_id: web::Path<String>,
) -> impl Responder {
    match orchestrator.create_match(data.into_inner(), org_id.into_inner()).await {
        Ok(match_data) => generic_response(
            StatusCode::CREATED,
            Some("Successfully created".to_string()),
            Some(match_data),
        ),
        Err(e) => generic_response::<String>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(e.to_string()),
            None,
        )
    }
}