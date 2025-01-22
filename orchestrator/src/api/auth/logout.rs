use actix_web::{post, HttpResponse};
use actix_web::cookie::{Cookie, Expiration, SameSite};
use actix_web::cookie::time::OffsetDateTime;
use crate::models::api_response::ApiResponse;

#[post("/logout")]
pub async fn logout() -> HttpResponse {
    let expired_cookie = Cookie::build("token", "")
        .path("/")
        .same_site(SameSite::None)
        .expires(Expiration::from(OffsetDateTime::UNIX_EPOCH))
        .finish();

    HttpResponse::Ok()
        .cookie(expired_cookie)
        .json(ApiResponse::<String> {
            msg: Option::from(String::from("Successfully logged out")),
            data: None
        })
}