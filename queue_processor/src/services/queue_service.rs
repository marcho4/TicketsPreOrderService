use std::collections::HashMap;
use std::sync::Arc;
use crate::models::models::{EmailTemplates, Match, MessageResp, Recipient, SendEmailRequest, Ticket, User, UserResp};
use rdkafka::Message;
use log::{error, info};
use futures_util::StreamExt;

use log::LevelFilter;
use env_logger;
use rdkafka::consumer::{CommitMode, Consumer, StreamConsumer};
use rdkafka::message::BorrowedMessage;
use reqwest::Method;
use serde_json::json;
use crate::models::models::{TicketInfo, TicketReservation};
use crate::utils::config::Config;
use crate::models::orchestrator_error::OrchestratorError;
use crate::models::orchestrator_error::OrchestratorError::{Deserialize, Request, Service};
use crate::services::kafka_service::KafkaService;
use crate::services::redis_service::RedisService;

pub struct QueueService {
    consumer: Arc<StreamConsumer>,
    tickets_url: String,
    http_client: reqwest::Client,
    redis_client: RedisService,
    kafka_service: KafkaService,
    user_url: String,
    matches_url: String,
}

pub fn init_logging() {
    env_logger::builder()
        .filter_level(LevelFilter::Debug)
        .init();
}

impl QueueService {
    pub async fn new(app_config: &Config) -> Self {
        let kafka = KafkaService::new(&app_config.kafka_url).await;
        let consumer = kafka.get_consumer();
        let redis = RedisService::new(app_config.redis_url.clone()).await;

        info!("Перехожу к созданию топика...");
        let res = kafka.create_topic(app_config.topic_name.clone()).await;
        if res.is_err() {
            error!("Не удалось создать топик: {}", res.err().unwrap());
        }

        consumer.subscribe(&[app_config.topic_name.as_str()])
            .expect("Не удалось подписаться на топик");

        Self {
            consumer,
            redis_client: redis,
            tickets_url: app_config.tickets_url.clone(),
            http_client: reqwest::Client::new(),
            kafka_service: kafka,
            matches_url: app_config.matches_url.clone(),
            user_url: app_config.user_url.clone()
        }
    }

    pub async fn process_msg(&self, msg: &BorrowedMessage<'_>) {
        let payload = String::from_utf8_lossy(msg.payload().unwrap()).to_string();
        info!("Обрабатываю сообщение: {} ...", payload);
        let ticket_info: Result<TicketInfo, serde_json::Error> =
            serde_json::from_str(payload.as_str());

        if ticket_info.is_err() {
            error!("Сообщение неверного формата.");
            return;
        }

        let ticket_info = ticket_info.unwrap();

        if let Some(target_user) = self.redis_client.find_matching_user(&ticket_info).await {
            info!("Найден подходящий пользователь");

            match self.reserve_ticket(&ticket_info.ticket_id, TicketReservation {
                match_id: ticket_info.match_id.clone(),
                user_id: target_user.user_id.clone(),
            }).await {
                Ok(_) => {
                    info!("Успешно зарезервировал билет за user {}", target_user.user_id);

                    let delete_result = self.redis_client
                        .delete_from_queue(&ticket_info.match_id, target_user.user_id.clone()).await;

                    match delete_result {
                        Ok(_) => {
                            info!("Пользователь {} успешно удален", &target_user.user_id);
                        }
                        Err(e) => {
                            error!("Не удалось удалить пользователя: {}", e.to_string())
                        }
                    }


                    let user = match self.get_user(&target_user.user_id).await {
                        Ok(user) => user,
                        Err(e) => {
                            error!("Не удалось получить инфу о юзере");
                            error!("{}", e.to_string());
                            return;
                        }
                    };

                    let match_info = match self.get_match(&ticket_info.match_id).await {
                        Ok(match_info) => match_info,
                        Err(e) => {
                            error!("Не удалось получить инфу о юзере");
                            error!("{}", e.to_string());
                            return;
                        }
                    };

                    let ticket = match self.get_ticket(ticket_info.ticket_id.clone()).await {
                        Ok(ticket) => ticket,
                        Err(e) => {
                            error!("{}", e.to_string());
                            return;
                        }
                    };


                    let mut vars: HashMap<String, serde_json::Value> = HashMap::new();

                    vars.insert("logo_url".into(), json!(""));
                    vars.insert("user_name".into(), json!(user.name.clone()));
                    vars.insert("match_title".into(),json!(format!("{} - {}", match_info.team_home, match_info.team_away)));
                    vars.insert("match_date".into(),json!(match_info.match_date_time.date_naive()));
                    vars.insert("match_time".into(), json!(match_info.match_date_time.time()));
                    vars.insert("stadium".into(), json!(match_info.stadium));
                    vars.insert("ticket_sector".into(), json!(ticket.sector));
                    vars.insert("ticket_row".into(), json!(ticket.row));
                    vars.insert("ticket_seat".into(), json!(ticket.seat));
                    vars.insert("order_id".into(), serde_json::to_value(&ticket_info.ticket_id).unwrap());
                    vars.insert("order_details_url".into(), json!(""));
                    vars.insert("cancel_order_url".into(), json!(""));
                    vars.insert("support_email".into(), json!(""));
                    vars.insert("service_name".into(), json!("TicketsPreOrder"));


                    let subject= "Ваша заявка на предзаказ билета осуществлена".to_string();

                    let recipient = Recipient {
                        email: target_user.email.clone(),
                        name: user.name.clone(),
                    };

                    let data = SendEmailRequest {
                        template_id: EmailTemplates::AutoPreorderSuccess,
                        recipient,
                        subject,
                        variables: vars,
                        metadata: None,
                    };

                    match self.
                        kafka_service.safe_send_msg::<SendEmailRequest>(data, "email-tasks", "email-notification").await {
                        Ok(_) => {
                            info!("Предзаказ успешно обработан!")
                        },
                        Err(e) => {
                            error!("Не удалось отправить сообщение на таск в кафку: {}", e.to_string());

                        }
                    }
                }
                Err(e) => {
                    error!("Не удалось зарезервировать билет: {}", e.to_string());
                    return;
                }
            }
        }
    }
    pub async fn start_polling(&self) {
        info!("Запускаю polling сообщений");

        let mut stream = self.consumer.stream();
        while let Some(msg) = stream.next().await {
            match msg {
                Ok(m) => {
                    self.process_msg(&m).await;
                    match self.consumer.commit_message(&m, CommitMode::Async) {
                        Ok(_) => info!("Successfully committed message offset"),
                        Err(e) => error!("Error committing message offset: {}", e),
                    }
                },
                Err(e) => {
                    error!("Ошибка при чтении сообщения: {}", e);
                }
            }
        }
    }


    pub async fn reserve_ticket(&self, ticket_id: &String, data: TicketReservation) -> Result<MessageResp, OrchestratorError> {
        let url = format!("{}/ticket/{}/reserve", self.tickets_url, ticket_id);
        let response = self.http_client
            .request(Method::PUT, &url)
            .json(&data)
            .send().await.map_err(|e| {
                error!("Error while sending request to {}: {:?}", url, e);
                Request(e)
            }
        )?;

        let status_code = response.status().as_u16();
        let mut text = response.text().await.unwrap_or("{}".to_string());
        if text.is_empty() {
            text = "{}".to_string();
        }
        let err = Self::check_response(status_code, &text);
        if let Some(err) = err {
            return Err(err);
        }

        let result = serde_json::from_str::<MessageResp>(&text).map_err(|e| {
            error!("Error while deserializing: {:?}", e);
            error!("Error response body: {:?}", text);
            Deserialize(e)
        })?;


        Ok(result)
    }

    fn check_response(status: u16, text: &String) -> Option<OrchestratorError> {
        if status >= 299 {
            error!("Error with status code {} : {}", status, text);
            Some(Service(format!("Bad response from service. Details: {}", text)))
        } else {
            None
        }
    }

    pub async fn get_user(&self, id: &String) -> Result<User, OrchestratorError> {
        let url = format!("{}/user/{}/get_account_info", self.user_url, id);
        info!("Getting user from {}", url);
        
        let resp = match self.http_client.get(&url).send().await {
            Ok(r) => r,
            Err(e) => {
                error!("Error while sending request to {}: {:?}", url, e);
                error!("Network error details: {:?}", e);
                return Err(Request(e));
            }
        };

        let status = resp.status();
        info!("Response status: {}", status);
        
        let text = match resp.text().await {
            Ok(t) => {
                info!("Response text: {}", t);
                t
            },
            Err(e) => {
                error!("Failed to get response text: {:?}", e);
                return Err(Service(format!("Failed to get response text: {}", e)));
            }
        };
        
        if text.is_empty() {
            error!("Empty response from user service");
            return Err(Service("Empty response from user service".to_string()));
        }
        
        let serialized = serde_json::from_str::<UserResp>(&text).map_err(|e| {
            error!("Error while deserializing response: {:?}", e);
            error!("Error response body: {:?}", &text);
            Deserialize(e)
        })?;
        serialized.data.ok_or_else(|| Service(serialized.message))
    }

    pub async fn get_match(&self, match_id: &String) -> Result<Match, OrchestratorError> {
        let url = format!("{}/api/match/get_match/{}", self.matches_url, match_id);
        info!("Getting match from {}", url);
        
        let resp = match self.http_client.get(&url).send().await {
            Ok(r) => r,
            Err(e) => {
                error!("Error while sending request to {}: {:?}", url, e);
                error!("Network error details: {:?}", e);
                return Err(Request(e));
            }
        };

        let status = resp.status();
        info!("Match response status: {}", status);
        
        let text = match resp.text().await {
            Ok(t) => {
                info!("Match response text: {}", t);
                t
            },
            Err(e) => {
                error!("Failed to get match response text: {:?}", e);
                return Err(Service(format!("Failed to get match response text: {}", e)));
            }
        };
        
        if text.is_empty() {
            error!("Empty response from matches service");
            return Err(Service("Empty response from matches service".to_string()));
        }
        
        Ok(serde_json::from_str::<Match>(&text).map_err(|e| {
            error!("Error while deserializing match: {:?}", e);
            error!("Error response body: {:?}", &text);
            Deserialize(e)
        })?)
    }

    pub async fn get_ticket(&self, ticket_id: String) -> Result<Ticket, OrchestratorError> {
        let url = format!("{}/ticket/{}", self.tickets_url, ticket_id);
        let resp = self.http_client.get(&url).send().await.map_err(|e| {
            error!("Error while sending request to {}: {:?}", url, e);
            Request(e)
        })?;
        let text = resp.text().await.unwrap_or("{}".to_string());
        Ok(serde_json::from_str::<Ticket>(&text).map_err(|e| {
            error!("Error while deserializing: {:?}", e);
            error!("Error response body: {:?}", &text);
            Deserialize(e)
        })?)
    }
}