use actix_web::web;
use crate::api::organizer::get_organizer_data::get_organizer;

pub fn organizer_config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/organizer")
            .service(get_organizer)
    );
}