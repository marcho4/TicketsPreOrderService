use actix_web::{get, web, HttpResponse};
use actix_web::web::Json;
use crate::models::admin_request::AdminRequest;
use crate::models::api_response::ApiResponse;
use crate::orchestrator::orchestrator::Orchestrator;

#[get("/requests")]
pub async fn get_requests(orch: web::Data<Orchestrator>) -> HttpResponse {
    let url = "http://localhost:8003/pending_requests";
    let response = orch.client.get(url).send().await;
    match response {
        Ok(res) => {
            let res_serialized = res.json::<Vec<AdminRequest>>().await;
            let serialized = match res_serialized {
                Ok(serialized) => {serialized},
                Err(e) => {return HttpResponse::InternalServerError().json(ApiResponse::<String> {
                    msg: Some(format!("Internal server error: {}", e)),
                    data: None,
                })}
            };
            HttpResponse::Ok().json(
                ApiResponse::<Vec<AdminRequest>>  {
                    msg: Some("Successfully fetched requests".to_string()),
                    data: Some(serialized),
                }
            )
        },
        Err(_e) => {HttpResponse::InternalServerError().json(
            ApiResponse {
                msg: Some("Error in admin service".to_string()),
                data: None
            }
        ) }
    }
}