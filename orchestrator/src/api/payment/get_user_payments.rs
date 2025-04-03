use actix_web::{get, http::StatusCode, web, Responder};
use crate::{models::payments::Payment, orchestrator::orchestrator::Orchestrator, utils::responses::generic_response};

#[get("/user/{id}")]
pub async fn get_user_payments(path: web::Path<String>, orchestrator: web::Data<Orchestrator>) -> impl Responder {
    let user_id = path.into_inner();
    let payments = orchestrator.get_user_payments(user_id).await;
    match payments {
        Ok(payments) => generic_response::<Vec<Payment>>(StatusCode::OK, Some("OK".to_string()), Some(payments)),
        Err(e) => generic_response::<Vec<Payment>>(StatusCode::INTERNAL_SERVER_ERROR, Some(e.to_string()), None),
    }
}
