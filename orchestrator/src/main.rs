use std::time::Duration;
use crate::orchestrator::orchestrator::Orchestrator;
use actix_web::{ middleware, web, App, HttpServer};
use env_logger::Env;
use actix_cors::Cors;


mod orchestrator;
mod models;
mod api;
mod utils;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Init Orchestrator
    let orchestrator = Orchestrator::new();

    // Creating State with orchestrator
    let state = web::Data::new(orchestrator);
    env_logger::init_from_env(Env::default().default_filter_or("info"));

    // Start API
    HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .wrap(middleware::Logger::default())
            .wrap(Cors::default()
                .allowed_origin("http://localhost:3000")
                .allow_any_header()
                .allow_any_method()
                .supports_credentials()
            )
            .service(
                web::scope("/api")
                    .configure(api::auth::config::auth_config)
            )
    })
        .keep_alive(Duration::from_secs(75))
        .bind(("0.0.0.0", 8000))?
        .run()
        .await
}
