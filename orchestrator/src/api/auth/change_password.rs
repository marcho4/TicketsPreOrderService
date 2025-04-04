use actix_web::{web, HttpResponse, put, HttpRequest};
use actix_web::http::StatusCode;
use crate::models::api_response::ApiResponse;
use crate::models::password_update::PasswordUpdate;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::request_validator::RequestValidator;
use crate::utils::responses::generic_response;

#[utoipa::path(
    put,
    path = "/api/auth/password/change",
    description = "Позволяет поменять пароль на новый уже аутентифицированному пользователю",
    summary = "Поменять пароль",
    responses(
        (status = 200, description = "Successfully changed password", body = ApiResponse<String>),
        (status = 401, description = "Not authorized", body = ApiResponse<String>),
        (status = 500, description = "Internal server error while updating password", body = ApiResponse<String>)
    ),
    tag = "Auth"
)]
#[put("/password/change")]
pub async fn change_password(
    req: HttpRequest,
    data: web::Json<PasswordUpdate>,
    orchestrator: web::Data<Orchestrator>
) -> HttpResponse {

    let check_auth_res = RequestValidator::check_auth(&req);
    if let Err(e) = check_auth_res {
        return e;
    };

    let update_password_result = orchestrator
        .change_password(&data, check_auth_res.unwrap().auth_id).await;

    match update_password_result {
        Ok(update_password_result) => {
            generic_response::<String>(StatusCode::OK, Some(update_password_result.message), None)
        },
        Err(e) => generic_response::<String>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(String::from("Error while updating password")),
            Some(e.to_string()),
        )
    }
}