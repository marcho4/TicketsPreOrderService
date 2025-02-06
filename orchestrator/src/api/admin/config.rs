use crate::api::admin::get_requests::get_requests;
use crate::api::admin::process_request::process_request;
use actix_web::web;

pub fn admin_config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/admin")
            .service(get_requests)
            .service(process_request)
    );
}