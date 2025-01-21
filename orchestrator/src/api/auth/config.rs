use actix_web::{web};
use crate::api::auth::login::login;
use crate::api::auth::logout::logout;
use crate::api::auth::organizer_register::register_organizer;
use crate::api::auth::register::register_user;
use crate::api::auth::session::session;

pub fn auth_config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/auth")
            .service(logout)
            .service(login)
            .service(session)
            .service(register_organizer)
            .service(register_user)
    );
}