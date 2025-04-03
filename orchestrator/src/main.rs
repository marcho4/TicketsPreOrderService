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
use crate::utils::openapi::ApiDoc;

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
                    .configure(api::payment::config::payment_config)
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
