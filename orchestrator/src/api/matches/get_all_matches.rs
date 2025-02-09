use actix_web::{get, web, Responder};
use actix_web::http::StatusCode;
use crate::models::matches::Match;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;

#[get("/all")]
pub async fn get_all_matches(orchestrator: web::Data<Orchestrator>) -> impl Responder {
    match orchestrator.get_all_matches().await {
        Ok(results) => {
            generic_response::<Vec<Match>>(StatusCode::OK, Some("Successfully parsed".into()), Some(results))
        },
        Err(e) => generic_response::<String>(StatusCode::INTERNAL_SERVER_ERROR,
                                             None, Some(e.to_string()))
    }
}