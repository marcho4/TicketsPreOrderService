use actix_web::{post, web, HttpRequest, HttpResponse};
use crate::models::api_response::ApiResponse;
use crate::models::registration_user_resp::RegistrationUserResp;
use crate::models::user_registration_data::UserRegistrationData;
use crate::orchestrator::orchestrator::Orchestrator;

#[post("/register/user")]
pub async fn register_user(
    orchestrator: web::Data<Orchestrator>,
    data: web::Json<UserRegistrationData>,
    _req: HttpRequest
) -> HttpResponse {
    let url = format!("{}/user/register", orchestrator.config.auth_url);
    let data = data.into_inner();
    let response = orchestrator.client.post(&url).json(&data).send().await;
    let registration_res = match response {
        Ok(resp) => {
            if resp.status().is_success() {
                match resp.json::<RegistrationUserResp>().await {
                    Ok(data) => data,
                    Err(e) => return HttpResponse::InternalServerError().json(ApiResponse::<String> {
                        msg: Some("Error happened during processing response body from auth service".to_string()),
                        data: Some(e.to_string()),
                    }),
                }
            } else {
                return HttpResponse::InternalServerError().json(ApiResponse::<String> {
                    msg: Some("User with this email exists already. Enter another one".to_string()),
                    data: None,
                })
            }
        },
        Err(e) => return HttpResponse::InternalServerError().json(ApiResponse::<String> {
            msg: Some("Error happened during request to auth service".to_string()),
            data: Some(e.to_string()),
        }),
    };

    // Send email
    HttpResponse::Ok().json(ApiResponse::<RegistrationUserResp> {
        msg: Some("Successfully registered".to_string()),
        data: Some(registration_res)
    })
}