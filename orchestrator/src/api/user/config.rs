use actix_web::web;
use crate::api::user::get_user_data::get_user_data;
use crate::api::user::update_user::update_user;

pub fn user_config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/user")
            .service(get_user_data)
            .service(update_user)
    );
}