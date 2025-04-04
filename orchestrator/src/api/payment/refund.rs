use actix_web::{post, web, HttpRequest, Responder};
use actix_web::http::StatusCode;
use crate::models::api_response::ApiResponse;
use crate::models::message_resp::MessageResp;
use crate::models::payments::Payment;
use crate::models::roles::Role::USER;
use crate::models::tickets::TicketReservation;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::request_validator::RequestValidator;
use crate::utils::responses::generic_response;


#[utoipa::path(
post,
path = "/api/payments/refund/{payment_id}",
description = "Вернуть средства за билет",
summary = "Вернуть средства за билет",
tag = "Payment",
responses(
    (status = 200, body = ApiResponse<MessageResp>)
)
)]
#[post("/refund/{id}")]
pub async fn refund(
    id: web::Path<String>,
    orchestrator: web::Data<Orchestrator>,
    req: HttpRequest,
) -> impl Responder {
    let id = id.into_inner();
    if let Err(e) = RequestValidator::validate_req(&req, USER, None) {
        return e;
    }

    let user_id = RequestValidator::get_user_id(&req).unwrap();

    let payments = orchestrator.get_user_payments(user_id.clone()).await;

    match payments {
        Ok(payments) => {
            let found = payments.iter().find(|t| t.payment_id == id).is_some();

            if found {
                let refund = orchestrator.refund_payment(id).await;

                match refund {
                    Ok(refund) => {
                        let ticket_id = refund.data.unwrap();
                        match orchestrator.refund_ticket(ticket_id.ticket_id, TicketReservation {
                            user_id: user_id.clone(),
                            match_id: ticket_id.match_id,
                        }).await {
                            Ok(refund) => {
                                generic_response::<MessageResp>(
                                    StatusCode::OK,
                                    Some("Successfully refunded".to_string()),
                                    Some(refund),
                                )
                            },
                            Err(e) => generic_response::<String>(
                                StatusCode::INTERNAL_SERVER_ERROR,
                                Some("ERROR while refunding ticket".to_string()),
                                Some(format!("ERROR: {}", e)),
                            ),
                        }
                    },
                    Err(e) => generic_response::<String>(
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Some("ERROR while refunding payment".to_string()),
                        Some(format!("ERROR: {}", e)),
                    )
                }
            } else {
                generic_response::<Vec<Payment>>(
                    StatusCode::NOT_FOUND,
                    Some("Не существует такого платежа у данного пользователя".to_string()),
                    None,
                )
            }
        },
        Err(e) => generic_response::<Vec<Payment>>(StatusCode::INTERNAL_SERVER_ERROR, Some(e.to_string()), None)
    }
}   
