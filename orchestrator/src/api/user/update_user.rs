use actix_web::{put, web, HttpRequest, HttpResponse};
use actix_web::http::StatusCode;
use crate::models::api_response::ApiResponse;
use crate::models::message_resp::MessageResp;
use crate::models::roles::Role;
use crate::models::user_models::UserUpdateData;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::request_validator::RequestValidator;
use crate::utils::responses::generic_response;


#[utoipa::path(
    put,
    path = "/api/user/{id}/update",
    tag = "User",
    description = "Update user info",
    summary = "Обновить данные пользователя",
    params(
        ("id" = String, Path, description = "Unique user ID")
    ),
    request_body = UserUpdateData,
    responses(
        (status = 200, description = "Successfully updated", body = ApiResponse<MessageResp>),
        (status = 500, description = "Error", body = ApiResponse<String>)
    )
)]
#[put("/{id}/update")]
pub async fn update_user(
    id: web::Path<String>,
    data: web::Json<UserUpdateData>,
    orchestrator: web::Data<Orchestrator>,
    req: HttpRequest
) -> HttpResponse {
    let user_id = id.into_inner();

    let validation = RequestValidator::validate_req(&req, Role::USER,
                                                    Some(user_id.as_str()));

    if let Err(e) = validation {
        return e;
    }

    match orchestrator.update_user(data.into_inner(), user_id).await {
        Ok(okk) => {
            generic_response::<MessageResp>(StatusCode::OK, Some("Successfully updated.".to_string()),Some(okk))
        }
        Err(e) => {
            generic_response::<String>(
                StatusCode::INTERNAL_SERVER_ERROR,
                Some("Update error".to_string()),
                Some(e.to_string())
            )
        }
    }
}