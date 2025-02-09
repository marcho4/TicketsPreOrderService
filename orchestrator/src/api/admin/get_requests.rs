use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::*;
use actix_web::{get, web, HttpResponse};
use actix_web::http::StatusCode;
use crate::models::admin_request::AdminRequest;

#[get("/requests")]
pub async fn get_requests(orchestrator: web::Data<Orchestrator>) -> HttpResponse {
    let requests = orchestrator.get_admin_requests().await;
    match requests {
        Ok(req) => generic_response::<Vec<AdminRequest>>(
            StatusCode::OK,
            Some("Successfully fetched requests".to_string()),
            Some(req)
        ),
        Err(e) => generic_response::<String>(
            StatusCode::INTERNAL_SERVER_ERROR, Some(e.to_string()), None
        )
    }
}
