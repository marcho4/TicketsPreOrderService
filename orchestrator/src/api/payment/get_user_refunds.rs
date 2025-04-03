use actix_web::{get, web, HttpRequest, HttpResponse, Responder};
use crate::models::api_response::ApiResponse;
use crate::models::payments::Refund;
use crate::models::roles::Role::USER;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::request_validator::RequestValidator;

#[utoipa::path(
    get,
    path="/api/payments/refunds",
    description = "List all user refunds",
    tag = "Payment",
    responses(
        (status = 200, body = ApiResponse<Vec<Refund>>)
    )
)]
#[get("/refunds")]
pub async fn get_user_refunds(
    orchestrator: web::Data<Orchestrator>,
    req: HttpRequest,
) -> impl Responder {
    if let Err(e) = RequestValidator::validate_req(&req, USER, None) {
        return e;
    }

    let user_id = RequestValidator::get_user_id(&req).unwrap();

    let refunds = orchestrator.get_user_refunds(user_id).await;
    match refunds {
        Ok(refunds) => HttpResponse::Ok().json(refunds),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
    }
}