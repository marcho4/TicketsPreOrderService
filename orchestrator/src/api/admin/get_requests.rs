use actix_web::{get, web, HttpMessage, HttpRequest, HttpResponse};
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::*;
use actix_web::http::StatusCode;
use crate::models::admin::AdminRequest;
use crate::models::general::{ApiResponse, JwtClaims, Role};
use crate::utils::request_validator::RequestValidator;

#[utoipa::path(
    get,
    path = "/api/admin/requests",
    summary = "Получить заявки на регистрацию",
    responses(
        (status = 200, description = "Successfully fetched requests", body = ApiResponse<Vec<AdminRequest>>),
        (status = 500, description = "Internal server error")
    ),
    tag = "Admin"
)]
#[get("/requests")]
pub(crate) async fn get_requests(
    orchestrator: web::Data<Orchestrator>,
    req: HttpRequest
) -> HttpResponse {

    let validation = RequestValidator::validate_req(&req, Role::ADMIN, None);

    if let Err(e) = validation {
        return e;
    }

    let user_info = match req.extensions().get::<JwtClaims>() {
        Some(info) => info.clone(), // если нужен тип UserInfo вместо ссылки
        None => return generic_response::<String>(
            StatusCode::FORBIDDEN,
            Some("Access restricted. You have to login first.".to_string()),
            None,
        ),
    };

    if user_info.role != Role::ADMIN {
        return generic_response::<String>(
            StatusCode::FORBIDDEN,
            Some("Access restricted. You have to be admin to access.".to_string()),
            None,
        )
    }

    let requests = orchestrator.get_admin_requests().await;
    match requests {
        Ok(reqs) => generic_response::<Vec<AdminRequest>>(
            StatusCode::OK,
            Some("Successfully fetched requests".to_string()),
            Some(reqs)
        ),
        Err(e) => generic_response::<String>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(e.to_string()),
            None
        )
    }
}