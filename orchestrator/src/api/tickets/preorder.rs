use std::collections::HashMap;
use actix_web::{put, web, HttpMessage, HttpRequest, HttpResponse};
use actix_web::http::StatusCode;
use chrono::{Datelike, Utc};
use log::{error, info};
use serde_json::json;
use crate::models::api_response::ApiResponse;
use crate::models::email::{EmailTemplates, Recipient};
use crate::models::jwt_claims::JwtClaims;
use crate::models::message_resp::MessageResp;
use crate::models::roles::Role;
use crate::models::tickets::TicketReservation;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::request_validator::RequestValidator;
use crate::utils::responses::generic_response;

#[utoipa::path(
    put,
    path = "/api/tickets/preorder/{ticket_id}",
    tag = "Tickets",
    summary = "Предзаказать билет",
    description = "Предзаказать билет",
    params(
        ("ticket_id" = String, Path, description = "ID билета на предзаказ")
    ),
    responses(
        (status = 200, description = "Успешно предзаказано", body = ApiResponse<MessageResp>),
        (status = 403, description = "Forbidden: Access restricted due to missing or invalid credentials, wrong role, or mismatched user id"),
        (status = 500, description = "Internal Server Error", body=ApiResponse<String>)
    )
)]
#[put("/preorder/{ticket_id}")]
pub async fn preorder_ticket(
    req: HttpRequest,
    orchestrator: web::Data<Orchestrator>,
    ticket_id: web::Path<String>,
    reservation_data: web::Json<TicketReservation>
) -> HttpResponse {
    let ticket_id = ticket_id.into_inner();

    let validation = RequestValidator::validate_req(&req, Role::USER, None);

    if let Err(e) = validation {
        return e;
    }

    let mut data = reservation_data.into_inner();

    let binding = req.extensions();
    let jwt_claims = binding.get::<JwtClaims>().ok_or_else(|| {
        generic_response::<String>(
            StatusCode::FORBIDDEN,
            Some("Access restricted. You have to login first.".to_string()),
            None,
        )
    });

    if let Err(e) = jwt_claims {
        return e;
    }

    let jwt_claims = jwt_claims.unwrap();

    let user_id = &jwt_claims.user_id;
    data.user_id = user_id.clone();

    let user_info = orchestrator.get_user(user_id.clone()).await;
    if let Err(e) = user_info {
        return generic_response::<String>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(format!("Error getting user info: {}", e)),
            None,
        )
    }
    let user_info = user_info.unwrap();

    let ticket_info = orchestrator.get_ticket(ticket_id.clone()).await;
    if let Err(e) = ticket_info {
        return generic_response::<String>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(format!("Error getting ticket info: {}", e)),
            None,
        );
    }
    let ticket_info = ticket_info.unwrap();

    let match_info = orchestrator.get_match(&ticket_info.match_id.clone()).await;
    if let Err(e) = match_info {
        return generic_response::<String>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(format!("Error getting ticket's match data: {}", e)),
            None,
        )
    }
    let match_info = match_info.unwrap();


    match orchestrator.reserve_ticket(&ticket_id, data).await {
        Ok(ticket) => {
            let mut variables : HashMap<String, serde_json::Value> = HashMap::new();

            variables.insert("user_name".to_string(), json!(user_info.name.clone()));
            variables.insert("logo_url".to_string(), json!("www.example.com/logo.png"));
            variables.insert("match_title".to_string(), json!(match_info.team_home + " - " + match_info.team_away.to_string().as_str()));
            variables.insert("match_date".to_string(), json!(match_info.match_date_time.date_naive()));
            variables.insert("match_time".to_string(), json!(match_info.match_date_time.time()));
            variables.insert("stadium".to_string(), json!(match_info.stadium));
            variables.insert("ticket_row".to_string(), json!(ticket_info.row));
            variables.insert("ticket_seat".to_string(), json!(ticket_info.seat));
            variables.insert("ticket_sector".to_string(), json!(ticket_info.sector));
            variables.insert("order_details_url".to_string(), json!("http://localhost:3000/dashboard"));
            variables.insert("order_id".to_string(), json!(ticket_id));
            variables.insert("service_name".to_string(), json!("Tickets PreOrder Platform"));
            variables.insert("current_year".to_string(), json!(Utc::now().year()));
            variables.insert("company_name".to_string(), json!("Tickets PreOrder Platform"));

            match orchestrator.send_email(EmailTemplates::TicketPreOrder,
                Recipient{
                    name: user_info.name.clone(),
                    email: user_info.email.clone()
                },
                variables,
                None
            ).await {
                Ok(_) => {
                    info!("Email sent successfully for ticket preorder: {}", ticket_id);
                },
                Err(e) => {
                    error!(
                "Failed to send email for ticket preorder (ticket_id: {}): {}", ticket_id, e);
                }
            }

            generic_response::<MessageResp>(
                StatusCode::OK,
                Some("Success".to_string()),
                Some(ticket)
            )
        }
        Err(e) => generic_response::<MessageResp>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(e.to_string()),
            None
        )
    }
}