use actix_web::{post, web, HttpRequest, Responder};
use actix_web::http::StatusCode;
use crate::{models::payments::PaymentRequest, orchestrator::orchestrator::Orchestrator};
use crate::models::payments::{Payment, PaymentResponse};
use crate::models::general::Role::USER;
use crate::utils::request_validator::RequestValidator;
use crate::utils::responses::generic_response;
use crate::models::general::ApiResponse;
use crate::models::tickets::TicketReservation;

#[utoipa::path(
    post,
    path="/api/payments/pay",
    description="Create an orchestral payment",
    tag = "Payment",
    responses(
        (status = 200, body = ApiResponse<PaymentResponse>)
    )
)]
#[post("/pay")]
pub async fn pay(
    data: web::Json<PaymentRequest>,
    orchestrator: web::Data<Orchestrator>,
    req: HttpRequest,
) -> impl Responder {
    // Ищу есть ли у пользователя билет с id, если да - оплачиваю
    if let Err(e) = RequestValidator::validate_req(&req, USER, None) {
        return e;
    }
    let user_id = RequestValidator::get_user_id(&req).unwrap();
    let user_tickets = orchestrator.get_users_tickets(user_id).await;
    match user_tickets {
        Ok(tickets) => {
            let found = tickets.iter().find(|t| t.user_id == data.user_id);
            if found.is_some() {
                let data = data.into_inner();
                let payment = orchestrator.create_payment(&data).await;
                match payment {
                    Ok(payment) => {
                        let ticket_status_change = orchestrator.pay_for_ticket(data.ticket_id, TicketReservation {
                            user_id: data.user_id,
                            match_id: data.match_id,
                        }).await;
                        if ticket_status_change.is_ok() {
                             generic_response::<PaymentResponse>(
                                StatusCode::OK,
                                Some("Created payment".to_string()),
                                Some(payment),
                            )
                        } else {
                             generic_response::<PaymentResponse>(
                                StatusCode::OK,
                                Some("Created payment but ticket status wasn't modified".to_string()),
                                Some(payment),
                            )
                        }

                    },
                    Err(e) => generic_response::<String>(
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Some(format!("Ошибка платеже: {}", e.to_string())),
                        None,
                    ),
                }
            } else {
                generic_response::<String>(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Some("У пользователя не существует такого билета".to_string()),
                    None,
                )
            }
        }
        Err(e) => generic_response::<Vec<Payment>>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(format!("Ошибка при получении билетов пользователя: {}", e.to_string())),
            None,
        )
    }


}