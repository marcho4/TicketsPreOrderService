use actix_web::web;
use crate::api::tickets::add_tickets::add_tickets;
use crate::api::tickets::cancel_preorder::cancel_preorder;
use crate::api::tickets::get_available_tickets::get_available_tickets;
use crate::api::tickets::get_ticket::get_ticket;
use crate::api::tickets::get_tickets_by_user::get_tickets_by_user;
use crate::api::tickets::preorder::preorder_ticket;

pub fn config_services(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/tickets")
            .service(get_available_tickets)
            .service(get_tickets_by_user)
            .service(add_tickets)
            .service(preorder_ticket)
            .service(cancel_preorder)
            .service(get_ticket)
    );
}