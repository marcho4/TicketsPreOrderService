use actix_web::web;
use crate::api::tickets::add_tickets::add_tickets;
use crate::api::tickets::get_available_tickets::get_available_tickets;
use crate::api::tickets::get_tickets_by_user::get_tickets_by_user;

pub fn config_services(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/tickets")
            .service(get_available_tickets)
            .service(get_tickets_by_user)
            .service(add_tickets)
    );
}