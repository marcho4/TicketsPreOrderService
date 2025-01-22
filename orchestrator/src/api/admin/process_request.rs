use actix_web::{post, web, HttpResponse};
use crate::models::api_response::ApiResponse;
use crate::models::request_process_info::RequestProcessInfo;
use crate::orchestrator::orchestrator::Orchestrator;

#[post("/process")]
pub async fn process_request(data: web::Json<RequestProcessInfo>, orch: web::Data<Orchestrator>) -> HttpResponse {
    let url = "http://admin:8003/process_organizer".to_string();
    let json_body = data.into_inner();
    let response = orch.client.post(url).json(&json_body).send().await;
    match response {
        Ok(mut res) => {
            if !res.status().is_success() {
                HttpResponse::InternalServerError().json(ApiResponse::<String> {
                    msg: Some("Internal server error".to_string()),
                    data: None
                })
            } else {
                HttpResponse::Ok().json(ApiResponse::<String> {
                    msg: Some("Successfully proceed".to_string()),
                    data: Some(res.text().await.unwrap())
                })
            }
        },
        Err(e) => {HttpResponse::InternalServerError().json(ApiResponse::<String> {
            msg: Some("Internal server error".to_string()),
            data: None
            })
        }
    }
}