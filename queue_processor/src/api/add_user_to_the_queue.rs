use actix_web::{web, HttpResponse, post};
use crate::models::models::QueueModel;
use crate::services::redis_service::RedisService;

#[post("/user/{match_id}")]
pub async fn add_user_to_the_queue(
    redis: web::Data<RedisService>,
    body: web::Json<QueueModel>,
    match_id: web::Path<String>
) -> HttpResponse {
    let match_id = match_id.into_inner();
    let body = body.into_inner();
    match redis.add_to_queue(match_id, body).await {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(_) => HttpResponse::InternalServerError().finish()
    }
}