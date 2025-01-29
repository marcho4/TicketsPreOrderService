use std::env;
use std::time::Duration;
use crate::orchestrator::orchestrator::Orchestrator;
use actix_web::{ middleware, web, App, HttpServer};
use env_logger::Env;
use actix_cors::Cors;
use dotenv::dotenv;

mod orchestrator;
mod models;
mod api;
mod utils;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(Env::default().default_filter_or("info"));
    dotenv().ok();
    let is_docker = env::var("RUNNING_IN_DOCKER").is_ok();

    let config = if is_docker { "/app/docker.toml" } else { "src/orchestrator/dev.toml" };

    let orchestrator = Orchestrator::new(config);

    let state = web::Data::new(orchestrator);
    let front_url = state.config.frontend_url.clone();

    HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
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
            )
    })
        .keep_alive(Duration::from_secs(75))
        .bind(("0.0.0.0", 8000))?
        .run()
        .await
}
