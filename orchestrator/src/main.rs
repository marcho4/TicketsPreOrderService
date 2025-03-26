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
    update_match::__path_update_match
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

use crate::orchestrator::orchestrator::Orchestrator;
use actix_cors::Cors;
use actix_web::{error, middleware, web, App, HttpResponse, HttpServer};
use dotenv::dotenv;
use env_logger::Env;
use std::env;
use std::sync::Arc;
use std::time::Duration;
use crate::models::api_response::ApiResponse;

use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;
use crate::api::middleware::AuthMiddleware;

mod orchestrator;
mod models;
mod api;
mod utils;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(Env::default().default_filter_or("info"));
    dotenv().ok();
    let is_docker = env::var("RUNNING_IN_DOCKER").is_ok();

    let config_path = if is_docker { "/app/docker.toml" } else { "src/orchestrator/dev.toml" };

    let orchestrator = Orchestrator::new(config_path).await;

    let auth_middleware = AuthMiddleware {
        jwt_secret: Arc::new(orchestrator.jwt_key.clone())
    };

    let state = web::Data::new(orchestrator);
    let front_url = web::Data::new(state.config.frontend_url.clone());

    #[derive(OpenApi)]
    #[openapi(
        info(
            title = "Orchestrator API",
            description = "API for Tickets PreOrder Service",
            version = "1.0.0"
        ),
        paths(get_requests, process_request, login, logout, session, register_user, register_organizer,
            get_organizer, update_user, get_user_data, update, update_match, get_by_org, get_match,
            get_all_matches, delete_match, create_match, get_tickets_by_user, get_available_tickets,
            add_tickets, preorder_ticket, cancel_preorder, get_ticket, change_password, delete_tickets
        )
    )]
    struct ApiDoc;
    let openapi = ApiDoc::openapi();

    let json_cfg = web::Data::new(web::JsonConfig::default()
        .error_handler(|err, _req| {
            let err_msg = err.to_string();
            error::InternalError::from_response(err, HttpResponse::Conflict().json(
                ApiResponse::<String> {msg: Some(err_msg), data: None}
            ).into()).into()
        }));

    HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .app_data(json_cfg.clone())
            .wrap(middleware::Logger::default())
            .wrap(auth_middleware.clone())
            .wrap(Cors::default()
                .allowed_origin(&front_url)
                .allow_any_header()
                .allow_any_method()
                .supports_credentials()
            )
            .service(
                web::scope("/api")
                    .configure(api::auth::config::auth_config)
                    .configure(api::admin::config::admin_config)
                    .configure(api::organizer::config::organizer_config)
                    .configure(api::user::config::user_config)
                    .configure(api::matches::config::cfg)
                    .configure(api::tickets::config::config_services)
            )
            .service(
                SwaggerUi::new("/swagger-ui/{_:.*}").url("/api-docs/openapi.json", openapi.clone()),
            )
    })
        .keep_alive(Duration::from_secs(75))
        .bind(("0.0.0.0", 8000))?
        .run()
        .await
}
