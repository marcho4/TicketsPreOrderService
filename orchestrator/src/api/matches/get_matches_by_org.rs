use actix_web::{get, web, Responder};
use actix_web::http::StatusCode;
use crate::models::matches::Match;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;

#[get("/org/{org_id}")]
pub async fn get_by_org(org_id: web::Path<String>, orchestrator: web::Data<Orchestrator>) -> impl Responder {
    match orchestrator.get_matches_by_org(org_id.into_inner()).await {
        Ok(matches) => {
            generic_response::<Vec<Match>>(StatusCode::OK, Some("Success".into()), Some(matches))
        },
        Err(e) => {
            generic_response::<String>(StatusCode::INTERNAL_SERVER_ERROR, Some("Error".into()), Option::from(e.to_string()))
        }
    }
}