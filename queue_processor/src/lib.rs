pub mod services;
pub mod utils;
pub mod models;
pub mod api;
pub mod configs;

// Реэкспортируем основные структуры для удобства
pub use services::queue_service::{QueueService, init_logging};
pub use services::kafka_service::KafkaService;
pub use services::redis_service::RedisService; 
pub use utils::config::Config;