use crate::api::organizer::get_organizer_data::get_organizer;
use crate::api::organizer::update_organizer_data::update;
use actix_web::web;

pub fn organizer_config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/organizer")
            .service(get_organizer)
            .service(update)
    );
}