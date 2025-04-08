use std::collections::HashMap;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;
use actix_web::http::StatusCode;
use actix_web::{post, web, HttpRequest, HttpResponse};
use chrono::{Datelike, Utc};
use log::error;
use serde_json::json;
use crate::models::email::{EmailTemplates, Recipient};
use crate::models::general::ApiResponse;
use crate::models::organizer::{OrganizerRegistrationData, RegistrationOrgResp};

#[utoipa::path(
    post,
    path = "/api/auth/register/organizer/",
    description = "Register the organizer",
    tag = "Auth",
    summary = "Зарегистрироваться как организатор",
    responses(
        (status = 200, description = "Successful performing a registration operation", body = ApiResponse<RegistrationOrgResp>),
        (status = 500, description = "Internal server error", body = ApiResponse<String>),
    )
)]
#[post("/register/organizer")]
pub async fn register_organizer(
    orchestrator: web::Data<Orchestrator>,
    data: web::Json<OrganizerRegistrationData>,
    _req: HttpRequest,
) -> HttpResponse {
    let data = data.into_inner();

    // Send request to organizer service
    let org_data = match orchestrator.org_register(&data).await {
        Ok(org_resp) => org_resp,
        Err(e) => {
            return generic_response::<String>(
                StatusCode::INTERNAL_SERVER_ERROR,
                Some(e.to_string()),
                None,
            )
        }
    };

    // Send request to admin service
    let admin_resp = orchestrator.add_organizer_request(&data).await;

    // If request failed
    if admin_resp.is_err() {
        let err = admin_resp.unwrap_err();
        error!("Error while adding admin request: {:?}", err);
        return generic_response::<String>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(err.to_string()),
            None,
        );
    };

    let recipient = Recipient {
        email: data.email,
        name: data.company.clone()
    };

    let mut variables: HashMap<String, serde_json::Value> = HashMap::new();
    variables.insert("logo_url".to_string(), json!("https://example.com/logo.png"));
    variables.insert("user_name".to_string(), json!(data.company.clone()));
    variables.insert("service_name".to_string(), json!("Tickets PreOrder Platform"));
    variables.insert("current_year".to_string(), json!(Utc::now().year()));
    variables.insert("company_name".to_string(), json!("Tickets PreOrder Platform"));


    let email_resp = orchestrator.send_email(
        EmailTemplates::OrgRegistration,
        recipient,
        variables,
        None
    ).await;

    if email_resp.is_err() {
        error!("Error while sending email");
        // Мейби добавить логику оповещения разработчиков
    };

    generic_response::<RegistrationOrgResp>(
        StatusCode::OK,
        Some("Successfully registered".to_string()),
        Some(org_data),
    )
}
