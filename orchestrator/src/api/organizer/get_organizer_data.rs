use actix_web::{get, web, HttpResponse};
use crate::models::api_response::ApiResponse;
use crate::models::organizer_info::OrganizerInfo;
use crate::orchestrator::orchestrator::Orchestrator;

#[get("/get/{id}")]
pub async fn get_organizer(id: web::Path<String>, orch: web::Data<Orchestrator>) -> HttpResponse {
    // Добавить проверку на авторизацию
    let parsed = orch.get_org_info(id.into_inner()).await;
    match parsed {
        Ok(organizer) => {HttpResponse::Ok().json(ApiResponse::<OrganizerInfo> {
            msg: Some("Successfully found organizer".to_string()),
            data: Some(organizer)
        })},
        Err(err) => {HttpResponse::Ok().json(ApiResponse::<OrganizerInfo> {
            msg: Some(format!("Failed to get organizer: {}", err.to_string())),
            data: None
        })}
    }
}