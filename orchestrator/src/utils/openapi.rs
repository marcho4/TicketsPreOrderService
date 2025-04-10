use utoipa::OpenApi;

use crate::api::user::{
    update_user::__path_update_user,
    get_user_data::__path_get_user_data
};
use crate::api::auth::{
    session::__path_session,
    login::__path_login,
    logout::__path_logout,
    user_register::__path_register_user,
    organizer_register::__path_register_organizer,
    change_password::__path_change_password
};
use crate::api::payment::{
    pay::__path_pay,
    get_user_payments::__path_get_user_payments,
    get_user_refunds::__path_get_user_refunds,
    payment_status::__path_get_payment_status,
    refund::__path_refund
};

use crate::api::admin::{
    process_request::__path_process_request,
    get_requests::__path_get_requests
};
use crate::api::organizer::{
    get_organizer_data::__path_get_organizer,
    update_organizer_data::__path_update
};
use crate::api::matches::{
    create_match::__path_create_match,
    delete_match::__path_delete_match,
    get_match::__path_get_match,
    get_all_matches::__path_get_all_matches,
    get_matches_by_org::__path_get_by_org,
    update_match::__path_update_match,
    delete_from_queue::__path_delete_from_queue,
    add_user_to_the_queue::__path_add_user_to_queue
};
use crate::api::tickets::{
    add_tickets::__path_add_tickets,
    get_available_tickets::__path_get_available_tickets,
    get_tickets_by_user::__path_get_tickets_by_user,
    cancel_preorder::__path_cancel_preorder,
    preorder::__path_preorder_ticket,
    get_ticket::__path_get_ticket,
    delete_tickets::__path_delete_tickets,
};


#[derive(OpenApi)]
#[openapi(
    info(
        title = "Orchestrator API",
        description = "API for Tickets PreOrder Service",
        version = "1.0.0",
    ),
    paths(get_requests, process_request, login, logout, session, register_user, register_organizer,
        get_organizer, update_user, get_user_data, update, update_match, get_by_org, get_match,
        get_all_matches, delete_match, create_match, get_tickets_by_user, get_available_tickets,
        add_tickets, preorder_ticket, cancel_preorder, get_ticket, change_password, delete_tickets,
        pay, get_user_payments, get_user_refunds, get_payment_status, refund, add_user_to_queue, delete_from_queue
    )
)]
pub struct ApiDoc;