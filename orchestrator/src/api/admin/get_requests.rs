use actix_web::{get, web, HttpResponse};
use crate::models::admin_request::AdminRequest;
use crate::models::api_response::ApiResponse;
use crate::orchestrator::orchestrator::Orchestrator;

#[get("/requests")]
pub async fn get_requests(orchestrator: web::Data<Orchestrator>) -> HttpResponse {
    let requests = orchestrator.get_admin_requests().await;
    if requests.is_ok() {
        let requests = requests.unwrap();
        HttpResponse::Ok().json(
            ApiResponse::<Vec<AdminRequest>>  {
                msg: Some("Successfully fetched requests".to_string()),
                data: Some(requests),
            }
        )
    } else {
        let err = requests.err().unwrap();
        HttpResponse::InternalServerError().json(ApiResponse::<String> {
            msg: Some("Error happened during the request".to_string()),
            data: Some(err.to_string())
        })
    }
}