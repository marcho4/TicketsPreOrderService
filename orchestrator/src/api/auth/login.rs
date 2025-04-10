use crate::orchestrator::orchestrator::Orchestrator;
use actix_web::cookie::time::Duration;
use actix_web::cookie::{Cookie, SameSite};
use actix_web::{post, web, HttpResponse};
use actix_web::http::StatusCode;
use crate::models::auth::AuthRequest;
use crate::models::general::ApiResponse;
use crate::models::user::UserInfo;
use crate::utils::responses::generic_response;


#[utoipa::path(
    post,
    path = "/api/auth/login",
    summary = "Войти в аккаунт",
    responses(
        (status = 200, description = "Successfully logged in", body = ApiResponse<UserInfo>),
        (status = 401, description = "Not authorized", body = ApiResponse<String>),
        (status = 500, description = "Internal server error with creating JWT", body = ApiResponse<String>)
    ),
    tag = "Auth"
)]
#[post("/login")]
pub async fn login(
    orchestrator: web::Data<Orchestrator>,
    req_data: web::Json<AuthRequest>,
) -> HttpResponse {
    let login_data = req_data.into_inner();

    let resp = match orchestrator.authorize(&login_data).await {
        Ok(r) => r,
        Err(e) => return
            generic_response::<String>(StatusCode::UNAUTHORIZED, Some(e.to_string()), None)
    };

    let jwt = match orchestrator.generate_jwt(&resp).await {
        Ok(jwt) => jwt,
        Err(e) => return generic_response::<String>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(e.to_string()),
            None
        )
    };

    let cookie = Cookie::build("token", jwt.clone())
        .path("/")
        .max_age(Duration::seconds(3600))
        .same_site(SameSite::Strict)
        .finish();

    HttpResponse::Ok().cookie(cookie).json(ApiResponse::<UserInfo> {
        msg: Some("Successfully authorized".to_string()),
        data: Some(resp),
    })
}