use actix_web::{get, web, HttpRequest, Responder};
use actix_web::http::StatusCode;
use crate::models::payments::PaymentStatus;
use crate::models::roles::Role::USER;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::request_validator::RequestValidator;
use crate::utils::responses::generic_response;
use crate::models::api_response::ApiResponse;
#[utoipa::path(
    post,
    path="/api/payments/{payment_id}/{payment_type}",
    tag = "Payment",
    responses(
        (status = 200, body = ApiResponse<PaymentStatus>)
    )
)]
#[get("/{id}/{type}")]
async fn get_payment_status(
    path: web::Path<(String, String)>,
    orchestrator: web::Data<Orchestrator>,
    req: HttpRequest,
) -> impl Responder {
    if let Err(e) = RequestValidator::validate_req(&req, USER, None) {
        return e;
    }

    let (payment_id, payment_type) = path.into_inner();
    let is_payment = payment_type == "refund";
    let payment_status = orchestrator.get_payment_status(payment_id, is_payment).await;

    match payment_status {
        Ok(payment_status) => generic_response::<PaymentStatus>(
            StatusCode::OK, Some("Успешно".to_string()), Some(payment_status)),
        Err(e) => generic_response::<String>(
            StatusCode::OK, Some("Ошибка".to_string()), Some(e.to_string())),
    }
}   