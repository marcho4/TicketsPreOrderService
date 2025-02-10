use actix_web::{delete, web, Responder};
use actix_web::http::StatusCode;
use crate::models::api_response::ApiResponse;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;


#[utoipa::path(
    delete,
    path = "/api/matches/{match_id}/{org_id}",
    tag = "Matches",
    description = "Delete match",
    summary = "Удалить матч",
    params(
        ("match_id" = String, Path, description = "Уникальный идентификатор матча, который удаляется"),
        ("org_id" = String, Path, description = "Уникальный идентификатор организатора, для которого удаляется матч.")
    ),
    responses(
        (status = 200, description = "Successfully deleted", body = ApiResponse<String>),
        (status = 500, description = "Error", body = ApiResponse<String>)
    )
)]
#[delete("/{match_id}/{org_id}")]
pub async fn delete_match(
    orchestrator: web::Data<Orchestrator>,
    path: web::Path<(String, String)>,
) -> impl Responder {
    let (match_id, org_id) = path.into_inner();
    match orchestrator.delete_match(match_id, org_id).await {
        Ok(_) => generic_response::<String>(
            StatusCode::OK,
            Some("Successfully deleted".to_string()),
            None,
        ),
        Err(e) => generic_response::<String>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(e.to_string()),
            None,
        )
    }
}