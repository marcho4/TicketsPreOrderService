use actix_web::{delete, web, Responder};
use actix_web::http::StatusCode;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;

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