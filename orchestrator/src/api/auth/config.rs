use actix_web::{web};
use crate::api::auth::logout::logout;

pub fn auth_config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/auth")
            .service(logout)
    );
}