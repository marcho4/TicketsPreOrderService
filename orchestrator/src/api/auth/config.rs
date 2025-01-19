use actix_web::{web};
use crate::api::auth::login::login;
use crate::api::auth::logout::logout;
use crate::api::auth::session::session;

pub fn auth_config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/auth")
            .service(logout)
            .service(login)
            .service(session)
    );
}