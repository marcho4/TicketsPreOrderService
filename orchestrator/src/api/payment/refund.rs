use actix_web::{post, web, HttpResponse, Responder};
    use crate::orchestrator::orchestrator::Orchestrator;

#[post("/refund/{id}")]
pub async fn refund(
    id: web::Path<String>,
    orchestrator: web::Data<Orchestrator>,
) -> impl Responder {
    let id = id.into_inner();
    let refund = orchestrator.refund_payment(id).await;
    match refund {
        Ok(refund) => HttpResponse::Ok().json(refund),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
    }
}