use crate::orchestrator::config::Config;
use config::Config as RustConfig;
use config::File;
use log::info;
use reqwest::Client;
use std::path::Path;
use std::sync::Arc;
use std::sync::atomic::AtomicI64;
use rdkafka::admin::{AdminClient, AdminOptions, NewTopic, TopicReplication};
use rdkafka::client::DefaultClientContext;
use rdkafka::config::ClientConfig;
use rdkafka::producer::FutureProducer;

pub struct Orchestrator {
    pub client: Client, // Клиент reqwest для обращения к другим микросервисам
    pub config: Config, // Конфиг для удобной работы с оркестратором
    pub jwt_key: String,
    pub producer: FutureProducer,
    pub email_counter: Arc<AtomicI64>
}

impl Orchestrator {
    pub async fn new(config_path: &str) -> Orchestrator {
        let jwt_key: String = dotenv::var("JWT")
            .expect("JWT key not found in .env");

        let conf = RustConfig::builder()
            .add_source(File::from(Path::new(config_path)))
            .build()
            .expect("Failed to build config");

        let config= conf.try_deserialize::<Config>()
            .expect("Failed to deserialize Orchestrator config");

        let kafka_producer: FutureProducer = ClientConfig::new()
            .set("bootstrap.servers", config.kafka_url.clone())
            .set("acks", "all")
            .set("enable.idempotence", "true")
            .set("max.in.flight.requests.per.connection", "1")
            // Поведение при повторных попытках
            .set("message.send.max.retries", "10")
            .set("retry.backoff.ms", "100")
            // Производительность
            .set("linger.ms", "50")
            .set("batch.num.messages", "1000")
            .set("compression.type", "lz4")
            // Логи / Статистика
            .set("client.id", "rust-async-producer")
            // Таймауты
            .set("delivery.timeout.ms", "5000")
            .create()
            .expect("Failed to create Kafka producer");

        let admin: AdminClient<DefaultClientContext> = ClientConfig::new()
            .set("bootstrap.servers", config.kafka_url.clone())
            .create()
            .expect("Failed to create admin client");

        let topic_not_exists = admin.inner()
            .fetch_metadata(None, std::time::Duration::from_secs(5))
            .expect("Failed to fetch topics").topics()
            .into_iter()
            .find(|topic| topic.name() == "email-tasks").is_none();


        if topic_not_exists {
            println!("Topics do not exist. Creating...");
            let new_topic = NewTopic::new("email-tasks", 1, TopicReplication::Fixed(1))
                .set("cleanup.policy", "compact");
            let results = admin
                .create_topics(&[new_topic], &AdminOptions::new())
                .await
                .expect("Failed to create new topic");
            println!("Successfully created topics: {:?}", results);
        }

        info!("Orchestrator jwt key: {}", jwt_key);

        Orchestrator {
            client: Client::new(),
            config,
            jwt_key,
            producer: kafka_producer,
            email_counter: Arc::new(AtomicI64::new(0))
        }
    }
}