use std::sync::Arc;
use chrono::Utc;
use log::{error, info};
use redis::aio::MultiplexedConnection;
use redis::{RedisError, RedisResult};
use tokio::sync::Mutex;
use crate::models::models::{QueueModel, TicketInfo};
use redis::AsyncCommands;

#[derive(Clone)]
pub struct RedisService {
    conn: Arc<Mutex<MultiplexedConnection>>,
}

impl RedisService {
    pub async fn new(url: String) -> RedisService {
        let redis_client = redis::Client::open(url)
            .expect("Can't create Redis client");
        info!("Создал клиента редис");

        let redis_connection_manager = redis_client
            .get_multiplexed_async_connection()
            .await
            .expect("Can't create Redis connection manager");
        info!("Создал асинхронное соединение");

        Self {
            conn: Arc::new(Mutex::new(redis_connection_manager)),
        }
    }
    pub async fn add_to_queue(&self, match_id: String, data: QueueModel) -> RedisResult<()> {
        let mut conn = self.conn.lock().await;
        let timestamp = chrono::Utc::now().timestamp();
        conn.zadd::<_, _, _, ()>(
            match_id,
            serde_json::to_string(&data).unwrap(),
            timestamp
        ).await
    }
    pub async fn delete_from_queue(&self, queue: &str, user_id: String) -> RedisResult<()> {
        let users = self.get_users_from_queue(&queue.to_string()).await?;

        let user_to_del = users.iter()
            .find(|u| u.user_id == user_id)
            .ok_or_else(|| RedisError::from((
                redis::ErrorKind::ClientError,
                "User not found in queue",
            )))?;

        let serialized = serde_json::to_string(user_to_del)
            .map_err(|e| RedisError::from((
                redis::ErrorKind::TypeError,
                "Serialization error",
                e.to_string(),
            )))?;

        let mut conn = self.conn.lock().await;
        conn.zrem::<_, _, ()>(queue, serialized).await?;

        Ok(())
    }
    pub async fn get_users_from_queue(&self, queue: &String) -> RedisResult<Vec<QueueModel>> {
        let users: RedisResult<Vec<String>> = self.conn.lock().await.zrangebyscore(
            queue, 0, Utc::now().timestamp()).await;

        let users = users?;

        let parsed_users = users.into_iter()
            .map(|u| -> QueueModel {
                return serde_json::from_str::<QueueModel>(u.as_ref()).unwrap();
            })
            .collect::<Vec<QueueModel>>();
        Ok(parsed_users)
    }
    pub async fn find_matching_user(&self, ticket: &TicketInfo) -> Option<QueueModel> {
        let users = match self.get_users_from_queue(&ticket.match_id).await {
            Ok(users) => users,
            Err(e) => {
                error!("Error getting users from queue: {}", e);
                return None;
            }
        };

        users.into_iter()
            .find(|user| user.min_price <= ticket.price && ticket.price <= user.max_price)
    }
}