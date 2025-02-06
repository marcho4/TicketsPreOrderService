use actix_web::http::StatusCode;
use crate::models::api_response::ApiResponse;
use actix_web::HttpResponse;
use serde::Serialize;
pub fn generic_response<T: Serialize>(status: StatusCode, msg: Option<String>, data: Option<T>) -> HttpResponse {
    HttpResponse::build(status).json(ApiResponse { msg, data })
}