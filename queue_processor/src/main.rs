use std::time::Duration;
use actix_web::{web, App, HttpServer};
use services::queue_service::{init_logging, QueueService};
use utils::config::Config as MainConfig;
use tokio;
use crate::api::add_ticket_event_to_kafka::add_ticket_event_to_kafka;
use crate::api::add_user_to_the_queue::add_user_to_the_queue;
use crate::api::get_queue::get_queue;
use crate::api::remove_user_from_the_queue::remove_user_from_the_queue;
use crate::services::kafka_service::KafkaService;
use crate::services::redis_service::RedisService;

mod services;
mod utils;
mod models;
mod api;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    init_logging();

    let config = MainConfig::from_toml();
    let queue_processor = QueueService::new(&config).await;

    tokio::spawn(async move {
        queue_processor.start_polling().await
    });

    let kafka_data = web::Data::new(KafkaService::new(config.kafka_url.as_str()).await);
    let redis_data = web::Data::new(RedisService::new(config.redis_url).await);

    Ok(HttpServer::new(move || {
        App::new()
            .app_data(kafka_data.clone())
            .app_data(redis_data.clone())
            .service(add_ticket_event_to_kafka)
            .service(remove_user_from_the_queue)
            .service(add_user_to_the_queue)
            .service(get_queue)
    })
        .bind(("0.0.0.0", 8020))?
        .keep_alive(Duration::from_secs(3600))
        .run()
        .await?
    )
}
