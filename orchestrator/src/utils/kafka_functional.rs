use std::sync::atomic::Ordering;
use log::info;
use rdkafka::error::KafkaError;
use rdkafka::message::OwnedHeaders;
use rdkafka::producer::{FutureRecord};
use std::time::Duration;
use tokio::time::sleep;

use crate::models::email::SendEmailRequest;
use crate::orchestrator::orchestrator::Orchestrator;

impl Orchestrator {
    pub async fn safe_send_email_task(&self, data: &SendEmailRequest)->Result<(), KafkaError> {
        let msg = serde_json::to_string(&data)
            .expect("Failed to serialize data to json");

        let mut last_error: Option<KafkaError> = None;

        for i in 1..=10 {
            match self.producer.send(
                FutureRecord::to("email-tasks")
                    .payload(&msg)
                    .key(format!("email-task-{}", self.email_counter.load(Ordering::Relaxed)).as_str())
                    .headers(OwnedHeaders::new()),
                None,
            ).await {
                Ok(_) => {
                    info!("Email task successfully sent!");
                    self.email_counter.fetch_add(1, Ordering::Relaxed);
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