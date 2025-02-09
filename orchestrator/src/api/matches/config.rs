use actix_web::web;
use crate::api::matches::create_match::create_match;
use crate::api::matches::delete_match::delete_match;
use crate::api::matches::get_all_matches::get_all_matches;
use crate::api::matches::get_match::get_match;
use crate::api::matches::get_matches_by_org::get_by_org;
use crate::api::matches::update_match::update_match;

pub fn cfg(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/matches")
            .service(get_all_matches)
            .service(create_match)
            .service(delete_match)
            .service(update_match)
            .service(get_match)
            .service(get_by_org)
    );
}