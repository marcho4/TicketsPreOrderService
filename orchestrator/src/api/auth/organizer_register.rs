use crate::models::organizer_registration_data::OrganizerRegistrationData;
use crate::models::registration_org_resp::RegistrationOrgResp;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;
use actix_web::http::StatusCode;
use actix_web::{post, web, HttpRequest, HttpResponse};
use log::error;
use crate::models::api_response::ApiResponse;

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

    generic_response::<RegistrationOrgResp>(
        StatusCode::OK,
        Some("Successfully registered".to_string()),
        Some(org_data),
    )
}
