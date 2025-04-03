use actix_web::web;
use crate::api::payment::pay::pay;
use crate::api::payment::refund::refund;
use crate::api::payment::get_user_payments::get_user_payments;
use crate::api::payment::get_user_refunds::get_user_refunds;
use crate::api::payment::payment_status::get_payment_status;

pub fn payment_config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/payment")
            .service(pay)
            .service(get_user_payments)
            .service(get_user_refunds)
            .service(refund)
            .service(get_payment_status)
    );
}