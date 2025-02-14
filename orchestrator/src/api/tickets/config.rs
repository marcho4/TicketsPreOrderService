use actix_web::web;
use crate::api::tickets::get_available_tickets::get_available_tickets;

pub fn config_services(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/tickets")
            .service(get_available_tickets)
    );
}