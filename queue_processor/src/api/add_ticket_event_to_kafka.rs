use actix_web::{web, post, Result, HttpResponse};
use actix_web::error::ErrorInternalServerError;
use log::error;
use crate::models::models::TicketInfo;
use crate::services::kafka_service::KafkaService;

#[post("/event")]
pub async fn add_ticket_event_to_kafka(
    data: web::Json<TicketInfo>,
    kafka_service: web::Data<KafkaService>,
) -> Result<HttpResponse> {
    let payload = data.into_inner();
    match kafka_service
        .safe_send_msg::<TicketInfo>(payload, "new_tickets", "add-ticket-msg").await {
        Ok(_) => Ok(HttpResponse::Ok().finish()),
        Err(e) => {
            error!("{}", e);
            Err(ErrorInternalServerError(e.to_string()))
        },
    }
}