use crate::models::organizer_info::OrganizerInfo;
use crate::orchestrator::orchestrator::Orchestrator;
use actix_web::{get, web, HttpResponse};
use actix_web::http::StatusCode;
use log::error;
use crate::utils::responses::generic_response;

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