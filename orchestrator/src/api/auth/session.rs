use crate::models::jwt_claims::JwtClaims;
use crate::orchestrator::orchestrator::Orchestrator;
use actix_web::{get, web, HttpRequest, HttpResponse};
use actix_web::http::StatusCode;
use chrono::Utc;
use crate::utils::responses::generic_response;

#[get("/session")]
pub async fn session(req: HttpRequest, orchestrator: web::Data<Orchestrator>) -> HttpResponse {
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