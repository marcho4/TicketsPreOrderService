use std::time::Duration;
use log::{error, info};
use rdkafka::admin::{AdminClient, AdminOptions, NewTopic, TopicReplication};
use rdkafka::client::DefaultClientContext;
use rdkafka::ClientConfig;
use rdkafka::config::{FromClientConfig, RDKafkaLogLevel};
use rdkafka::consumer::StreamConsumer;
use rdkafka::error::{KafkaError, KafkaResult};
use rdkafka::message::OwnedHeaders;
use rdkafka::producer::{FutureProducer, FutureRecord};
use serde::{Serialize};
use tokio::time::sleep;

pub struct KafkaService {
    producer: FutureProducer,
    admin: AdminClient<DefaultClientContext>,
    consumer: StreamConsumer,
}

impl KafkaService {
    pub async fn new(bootstrap_server: &str) -> Self {
        let url = bootstrap_server.to_string();

        let admin = Self::create_admin(url.clone());
        let producer = Self::create_producer(url.clone());
        let consumer = Self::create_stream_consumer(url.clone());

        Self {
            admin,
            producer,
            consumer,
        }
    }
    pub async fn create_topic(&self, topic_name: String) {
        let admin_options = &AdminOptions::default();
        let topic: NewTopic = NewTopic {
            name: topic_name.as_str(),
            num_partitions: 1,
            config: vec![],
            replication: TopicReplication::Fixed(1),
        };

        match self.admin.create_topics(vec![&topic], admin_options).await {
            Ok(ok) => info!("Топик успешно создан: {:?}", ok),
            Err(e) => error!("Не удалось создать топик: {}", e.to_string())
        }
    }
    pub fn create_admin(bootstrap_url: String) -> AdminClient<DefaultClientContext> {
        let adm_config = ClientConfig::new()
            .set("bootstrap.servers", bootstrap_url)
            .set("client.id", "Rust Queue Admin").to_owned();

        let admin = AdminClient::from_config(&adm_config)
            .expect("Не удалось создать админ клиента");
        info!("Создал AdminClint");

        admin
    }
    pub fn create_stream_consumer(bootstrap_url: String) -> StreamConsumer {
        let config = ClientConfig::new()
            .set_log_level(RDKafkaLogLevel::Debug)
            .set("group.id", "tickets")
            .set("enable.auto.commit", "false")
            .set("client.id", "Rust Queue Processor")
            .set("bootstrap.servers", bootstrap_url).to_owned();

        let consumer = StreamConsumer::from_config(&config)
            .expect("Не удалось создать потребителя сообщений с заданным конфигом");
        info!("Создал ConsumerClient");
        consumer
    }
    pub fn create_producer(bootstrap_url: String) -> FutureProducer {
        let kafka_producer: FutureProducer = ClientConfig::new()
            .set("bootstrap.servers", bootstrap_url)
            .set("acks", "all")
            .set("enable.idempotence", "true")
            .set("max.in.flight.requests.per.connection", "1")
            .set("message.send.max.retries", "10")
            .set("retry.backoff.ms", "100")
            .set("linger.ms", "50")
            .set("batch.num.messages", "1000")
            .set("compression.type", "lz4")
            .set("client.id", "rust-async-producer")
            .set("delivery.timeout.ms", "5000")
            .create()
            .expect("Failed to create Kafka producer");
        kafka_producer
    }
    pub async fn safe_send_msg<T: Serialize>(
        &self,
        data: T,
        topic: &str,
        key: &str
    ) -> KafkaResult<()> {
        let msg = serde_json::to_string(&data)
                .expect("Failed to serialize data to json");
        let mut last_error: Option<KafkaError> = None;

        for i in 1..=10 {
            match self.producer.send(
                FutureRecord::to(topic)
                    .payload(&msg)
                    .key(key)
                    .headers(OwnedHeaders::new()),
                None,
            ).await {
                Ok(_) => {
                    info!("Message successfully sent!");
                    return Ok(());
                }
                Err((err, _)) => {
                    info!("Attempt {} failed: {}. Retrying...", i, err);
                    last_error = Some(err);
                    sleep(Duration::from_millis(500)).await;
                }
            }
        }

        Err(last_error.unwrap())
    }
}
