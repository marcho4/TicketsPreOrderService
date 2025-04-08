use crate::models::user::User;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;
use actix_web::http::StatusCode;
use actix_web::{get, web, HttpRequest, HttpResponse};
use crate::models::general::ApiResponse;
use crate::models::general::Role;
use crate::utils::request_validator::RequestValidator;

#[utoipa::path(
    get,
    path = "/api/user/{id}",
    tag = "User",
    description = "Get user info",
    summary = "Получить данные пользователя",
    params(
        ("id" = String, Path, description = "Unique user ID"),
    ),
    responses(
        (status = 200, description = "Successfully found", body = ApiResponse<User>),
        (status = 500, description = "Error", body = ApiResponse<String>)
    )
)]
#[get("/{id}")]
pub async fn get_user_data(
    id: web::Path<String>,
    orchestrator: web::Data<Orchestrator>,
    req: HttpRequest,
) -> HttpResponse {
    let user_id = id.into_inner();

    let validation = RequestValidator::validate_req(&req, Role::USER,
                                                    Some(user_id.as_str()));

    if let Err(e) = validation {
        return e;
    }
    match orchestrator.get_user(user_id).await {
        Ok(user) => generic_response::<User>(StatusCode::OK, Some("Success".into()), Some(user)),
        Err(e) => {
            generic_response::<String>(StatusCode::INTERNAL_SERVER_ERROR, Some(e.to_string()), None)
        }
    }
}
