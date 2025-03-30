use actix_web::{web, HttpResponse, get};
use crate::services::redis_service::RedisService;

#[get("/queue/{match_id}")]
pub async fn get_queue(
    match_id: web::Path<String>,
    redis: web::Data<RedisService>,
) -> HttpResponse {
    let users = redis.get_users_from_queue(&match_id).await;
    match users {
        Ok(users) => {
            HttpResponse::Ok().json(users)
        },
        Err(e) => {
            HttpResponse::InternalServerError().json(e.detail())
        }
    }
}