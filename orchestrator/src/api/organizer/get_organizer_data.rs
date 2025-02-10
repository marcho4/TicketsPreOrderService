use crate::models::organizer_info::OrganizerInfo;
use crate::orchestrator::orchestrator::Orchestrator;
use actix_web::{get, web, HttpResponse};
use actix_web::http::StatusCode;
use log::error;
use crate::models::api_response::ApiResponse;
use crate::utils::responses::generic_response;



#[utoipa::path(
    get,
    path = "/api/organizer/get/{id}",
    tag = "Organizer",
    description = "Get match info",
    summary = "Получить данные организатора",
    params(
        ("id" = String, Path, description = "Unique organizer ID"),
    ),
    responses(
        (status = 200, description = "Successfully found", body = ApiResponse<OrganizerInfo>),
        (status = 500, description = "Error", body = ApiResponse<String>)
    )
)]
#[get("/get/{id}")]
pub async fn get_organizer(id: web::Path<String>, orchestrator: web::Data<Orchestrator>) -> HttpResponse {
    let parsed = orchestrator.get_org_info(id.into_inner()).await
        .map_err(|e| {
            error!("{}", e);
            generic_response(StatusCode::INTERNAL_SERVER_ERROR, None, Some(e.to_string()))
        });
    if parsed.is_err() {
        return parsed.unwrap_err();
    }
    generic_response::<OrganizerInfo>(
        StatusCode::OK,
        Some("Successfully found organizer".to_string()),
        Some(parsed.unwrap()),
    )
}