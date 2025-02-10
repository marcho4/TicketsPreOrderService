use crate::models::api_response::ApiResponse;
use actix_web::cookie::{Cookie, Expiration, SameSite, time::OffsetDateTime};
use actix_web::{post, HttpResponse, Responder};

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
        .same_site(SameSite::None)
        .expires(Expiration::from(OffsetDateTime::UNIX_EPOCH))
        .finish();


    HttpResponse::Ok()
        .cookie(expired_cookie)
        .json(ApiResponse::<String> {
            msg: Some("Successfully logged out".to_string()),
            data: None,
        })
}