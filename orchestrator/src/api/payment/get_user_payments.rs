use actix_web::{get, http::StatusCode, web, HttpRequest, Responder};
use crate::models::api_response::ApiResponse;
use crate::{models::payments::Payment, orchestrator::orchestrator::Orchestrator, utils::responses::generic_response};
use crate::models::roles::Role::USER;
use crate::utils::request_validator::RequestValidator;

#[utoipa::path(
get,
path="/api/payments",
description = "List all user payments",
tag = "Payment",
responses(
    (status = 200, body = ApiResponse<Vec<Payment>>)
)
)]
#[get("")]
pub async fn get_user_payments(
    orchestrator: web::Data<Orchestrator>,
    req: HttpRequest,
) -> impl Responder {
    if let Err(e) = RequestValidator::validate_req(&req, USER, None) {
        return e;
    }

    let user_id = RequestValidator::get_user_id(&req).unwrap();

    let payments = orchestrator.get_user_payments(user_id).await;
    match payments {
        Ok(payments) => generic_response::<Vec<Payment>>(StatusCode::OK, Some("OK".to_string()), Some(payments)),
        Err(e) => generic_response::<Vec<Payment>>(StatusCode::INTERNAL_SERVER_ERROR, Some(e.to_string()), None),
    }
}
