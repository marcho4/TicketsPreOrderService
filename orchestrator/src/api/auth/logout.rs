use crate::models::general::ApiResponse;
use actix_web::cookie::{Cookie, Expiration, SameSite, time::OffsetDateTime};
use actix_web::{post, HttpResponse, Responder};
use actix_web::cookie::time::Duration;


#[utoipa::path(
    post,
    path = "/api/auth/logout",
    summary = "Выйти из аккаунта",
    responses(
        (status = 200, description = "Successful log out", body = ApiResponse<String>)
    ),
    tag = "Auth"
)]
#[post("/logout")]
pub async fn logout() -> impl Responder {
    let expired_cookie = Cookie::build("token", "")
        .path("/")
        .same_site(SameSite::Strict)
        .max_age(Duration::seconds(0))
        .http_only(true)
        .finish();


    HttpResponse::Ok()
        .cookie(expired_cookie)
        .json(ApiResponse::<String> {
            msg: Some("Successfully logged out".to_string()),
            data: None,
        })
}