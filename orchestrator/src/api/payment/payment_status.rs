use actix_web::{get, web, Responder};
use actix_web::http::StatusCode;
use crate::models::payments::PaymentResponse;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;

#[get("/{id}/{type}")]
async fn get_payment_status(
    path: web::Path<(String, String)>,
    orchestrator: web::Data<Orchestrator>
) -> impl Responder {
    let (payment_id, payment_type) = path.into_inner();
    let is_payment = payment_type == "refund";
    let payment_status = orchestrator.get_payment_status(payment_id, is_payment).await;
    match payment_status {
        Ok(payment_status) => generic_response::<PaymentResponse>(
            StatusCode::OK, Some("Успешно".to_string()), Some(payment_status)),
        Err(e) => generic_response::<String>(
            StatusCode::OK, Some("Ошибка".to_string()), Some(e.to_string())),
    }
}   