use std::collections::HashMap;
use crate::orchestrator::orchestrator::Orchestrator;
use actix_web::{post, web, HttpRequest, HttpResponse};
use actix_web::http::StatusCode;
use chrono::{Datelike, Utc};
use serde_json::json;
use crate::models::email::{EmailTemplates, Recipient};
use crate::models::general::{ApiResponse, MessageResp};
use crate::models::user::{UserCreateData, UserRegistration, UserRegistrationData};
use crate::utils::errors::OrchestratorError;
use crate::utils::responses::generic_response;

#[utoipa::path(
    post,
    path = "/api/auth/register/user",
    request_body = UserRegistration,
    summary = "Зарегистрироваться как пользователь",
    responses(
        (status = 200, description = "Successfully registered", body = ApiResponse<MessageResp>),
        (status = 400, description = "Bad request. Error in user creation.", body = ApiResponse<String>),
        (status = 500, description = "Internal server error", body = ApiResponse<String>)
    ),
    tag = "Auth"
)]
#[post("/register/user")]
pub async fn register_user(
    orchestrator: web::Data<Orchestrator>,
    data: web::Json<UserRegistration>,
    _req: HttpRequest
) -> HttpResponse {
    // создать name, last_name, email
    // register name, last_name, email, user_id, login, password
    // generate jwt and set to cookies
    let data = data.into_inner();

    let user_create_data = UserCreateData {
        email: data.email.clone(),
        name: data.name.clone(),
        last_name: data.last_name.clone(),
        phone: data.phone.clone(),
        birthday: data.birthday.clone(),
    };

    let creation_result = match orchestrator.create_user(user_create_data).await {
        Ok(user) => user,
        Err(e) => {
            return match e {
                OrchestratorError::Service(msg) => {
                    generic_response::<String>(StatusCode::BAD_REQUEST, Some(msg), None)
                }
                _ => generic_response::<String>(StatusCode::BAD_REQUEST, Some(e.to_string()), None)
            }
        }
    };

    let register_data = UserRegistrationData {
        name: data.name.clone(),
        last_name: data.email.clone(),
        email: data.email.clone(),
        login: data.login.clone(),
        password: data.password.clone(),
        user_id: creation_result.data.id.clone(),
    };

    let register_result = match orchestrator.user_register(&register_data).await {
        Ok(user) => user,
        Err(e) => {
            return match e {
                OrchestratorError::Service(msg) => {
                    generic_response::<String>(StatusCode::BAD_REQUEST, Some(msg), None)
                }
                OrchestratorError::Request(msg) => {
                    generic_response::<String>(StatusCode::INTERNAL_SERVER_ERROR, Some(msg.to_string()), None)
                }
                _ => generic_response::<String>(StatusCode::INTERNAL_SERVER_ERROR, Some(e.to_string()), None)
            };
        }
    };

    let mut variables : HashMap<String, serde_json::Value> = HashMap::new();

    variables.insert("logo_url".to_string(), json!("www.example.com/logo.png"));
    variables.insert("user_name".to_string(), json!(data.name.clone()));
    variables.insert("account_url".to_string(), json!("http://localhost:3000/dashboard"));
    variables.insert("service_name".to_string(), json!("Tickets PreOrder Platform"));
    variables.insert("current_year".to_string(), json!(Utc::now().year()));
    variables.insert("company_name".to_string(), json!("Tickets PreOrder Platform"));

    let email_res = orchestrator.send_email(
        EmailTemplates::RegistrationSuccess,
        Recipient {
            name: data.name.clone(),
            email: data.email.clone(),
        },
        variables,
        None
    ).await;

    if let Err(e) = email_res {
        return generic_response::<String>(StatusCode::INTERNAL_SERVER_ERROR,
                                        Some("Error while creating task to send an email".to_string()),
                                        Some(e.to_string())
        );
    };

    generic_response::<MessageResp>(StatusCode::OK,
        Some("Successfully registered user!".to_string()),
        Some(register_result)
    )
}