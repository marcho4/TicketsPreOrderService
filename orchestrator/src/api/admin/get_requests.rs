use actix_web::{get, web, HttpResponse};
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::*;
use actix_web::http::StatusCode;
use crate::models::admin_request::AdminRequest;
use crate::models::api_response::ApiResponse;

#[utoipa::path(
    get,
    path = "/api/admin/requests",
    summary = "Получить заявки на регистрацию",
    responses(
        (status = 200, description = "Successfully fetched requests", body = ApiResponse<Vec<AdminRequest>>),
        (status = 500, description = "Internal server error")
    ),
    tag = "Admin"
)]
#[get("/requests")]
pub async fn get_requests(orchestrator: web::Data<Orchestrator>) -> HttpResponse {
    let requests = orchestrator.get_admin_requests().await;
    match requests {
        Ok(reqs) => generic_response::<Vec<AdminRequest>>(
            StatusCode::OK,
            Some("Successfully fetched requests".to_string()),
            Some(reqs)
        ),
        Err(e) => generic_response::<String>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(e.to_string()),
            None
        )
    }
}