use actix_web::{post, web, HttpResponse};
use crate::models::api_response::ApiResponse;

#[post("/process")]
pub async fn process_request(data: web::Json<RequestProcessInfo>) -> HttpResponse {

}