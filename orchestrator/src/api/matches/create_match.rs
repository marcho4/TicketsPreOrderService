use actix_web::{post, web, Responder};
use actix_web::http::StatusCode;
use crate::models::matches::CreateMatchData;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;

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