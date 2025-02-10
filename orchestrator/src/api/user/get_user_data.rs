use crate::models::user_models::User;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;
use actix_web::http::StatusCode;
use actix_web::{get, web, HttpResponse};
use crate::models::api_response::ApiResponse;

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
) -> HttpResponse {
    match orchestrator.get_user(id.into_inner()).await {
        Ok(user) => generic_response::<User>(StatusCode::OK, Some("Success".into()), Some(user)),
        Err(e) => {
            generic_response::<String>(StatusCode::INTERNAL_SERVER_ERROR, Some(e.to_string()), None)
        }
    }
}
