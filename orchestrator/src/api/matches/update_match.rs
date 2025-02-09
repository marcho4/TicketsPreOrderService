use actix_web::{put, web, Responder};
use actix_web::http::StatusCode;
use crate::models::matches::{Match, UpdateMatchData};
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;

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