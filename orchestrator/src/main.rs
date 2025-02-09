use crate::orchestrator::orchestrator::Orchestrator;
use actix_cors::Cors;
use actix_web::{error, middleware, web, App, HttpResponse, HttpServer};
use dotenv::dotenv;
use env_logger::Env;
use std::env;
use std::time::Duration;
use crate::models::api_response::ApiResponse;

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

    let orchestrator = Orchestrator::new(config_path);

    let state = web::Data::new(orchestrator);
    let front_url = state.config.frontend_url.clone();

    HttpServer::new(move || {
        let json_cfg = web::JsonConfig::default()
            .error_handler(|err, _req| {
                let err_msg = err.to_string();
                error::InternalError::from_response(err, HttpResponse::Conflict().json(
                    ApiResponse::<String> {msg: Some(err_msg), data: None}
                ).into()).into()
            });

        App::new()
            .app_data(state.clone())
            .app_data(json_cfg)
            .wrap(middleware::Logger::default())
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
            )
    })
        .keep_alive(Duration::from_secs(75))
        .bind(("0.0.0.0", 8000))?
        .run()
        .await
}
