use crate::models::jwt_claims::JwtClaims;
use crate::orchestrator::orchestrator::Orchestrator;
use actix_web::{get, web, HttpRequest, Responder};
use actix_web::http::StatusCode;
use chrono::Utc;
use crate::models::api_response::ApiResponse;
use crate::utils::responses::generic_response;


#[utoipa::path(
    get,
    path = "/api/auth/session",
    summary = "Получить данные о пользователе",
    responses(
        (status = 200, description = "Successfully logged in", body = ApiResponse<JwtClaims>),
        (status = 401, description = "Not authorized. No JWT in cookies or bad JWT", body = ApiResponse<String>),
        (status = 500, description = "Internal server error. JWT expired", body = ApiResponse<String>)
    ),
    description = "Check user session status. Requires 'token' cookie with valid JWT.",
    tag = "Auth"
)]
#[get("/session")]
pub async fn session(req: HttpRequest, orchestrator: web::Data<Orchestrator>) -> impl Responder {
    let cookie = req.cookie("token");
    if cookie.is_none() {
        return generic_response::<String>(
            StatusCode::UNAUTHORIZED,
            Some("Token not found".to_string()),
            None
        );
    };
    let cookie_value = cookie.unwrap().value().to_string();

    let jwt_claims = orchestrator.decode_jwt(cookie_value).await;
    match jwt_claims {
        Ok(jwt_claims) => {
            if jwt_claims.exp < Utc::now().timestamp() as u64 {
                return generic_response::<String>(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Some("JWT expired".to_string()),
                    None
                );
            };
            generic_response::<JwtClaims>(
                StatusCode::OK,
                Some("Success".to_string()),
                Some(jwt_claims)
            )
        }
        Err(e) => generic_response::<String>(
            StatusCode::UNAUTHORIZED,
            Some(e.to_string()),
            None
        )
    }
}