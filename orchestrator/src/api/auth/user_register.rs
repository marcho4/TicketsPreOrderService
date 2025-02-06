use crate::models::registration_user_resp::RegistrationUserResp;
use crate::models::user_registration_data::UserRegistrationData;
use crate::orchestrator::orchestrator::Orchestrator;
use actix_web::{post, web, HttpRequest, HttpResponse};
use actix_web::http::StatusCode;
use crate::utils::responses::generic_response;

#[post("/register/user")]
pub async fn register_user(
    orchestrator: web::Data<Orchestrator>,
    data: web::Json<UserRegistrationData>,
    _req: HttpRequest
) -> HttpResponse {
    let data = data.into_inner();
    match orchestrator.user_register(&data).await {
        Ok(user) => generic_response::<RegistrationUserResp>(
            StatusCode::CREATED,
            Some("Successfully registered".to_string()),
            Some(user)
        ),
        Err(e) =>generic_response::<RegistrationUserResp>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(e.to_string()),
            None
        ),
    }
}