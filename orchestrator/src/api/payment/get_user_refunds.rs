use actix_web::{get, web, HttpResponse, Responder};
use crate::orchestrator::orchestrator::Orchestrator;

#[get("/user/{id}/refunds")]
pub async fn get_user_refunds(path: web::Path<String>, orchestrator: web::Data<Orchestrator>) -> impl Responder {
    let user_id = path.into_inner();
    let refunds = orchestrator.get_user_refunds(user_id).await;
    match refunds {
        Ok(refunds) => HttpResponse::Ok().json(refunds),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
    }
}