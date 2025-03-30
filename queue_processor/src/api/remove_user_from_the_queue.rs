use actix_web::{delete, web, HttpResponse};
use crate::services::redis_service::RedisService;

#[delete("/user/{match_id}/{user_id}")]
pub async fn remove_user_from_the_queue(
    redis: web::Data<RedisService>,
    match_id: web::Path<(String, String)>,
) -> HttpResponse {
    let (match_id, user_id) = match_id.into_inner();

    match redis.delete_from_queue(&match_id, user_id).await {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(err) => {
            HttpResponse::InternalServerError().json(err.to_string())
        }
    }
}