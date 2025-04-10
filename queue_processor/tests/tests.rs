#[cfg(test)]
mod tests {
    use std::sync::Once;

    use log::info;
    use queue_processor::models::models::{QueueModel, TicketInfo};
    use queue_processor::{KafkaService, QueueService, RedisService};
    use queue_processor::utils::config::Config;
    use log::LevelFilter;
    use redis::AsyncCommands;
    use reqwest::StatusCode;
    use serde_json::json;

    static INIT: Once = Once::new();
    
    fn init_logging() {
        INIT.call_once(|| {
            env_logger::builder()
                .filter_level(LevelFilter::Info)
                .init();
        });
    }

    #[tokio::test]
    async fn queue_processor_creation_test() {
        init_logging();
        // создаем конфиг
        let config = Config::from_toml();

        // проверяем конфиг на корректность
        assert_eq!(config.kafka_url, "localhost:9092");
        assert_eq!(config.redis_url, "redis://:stefa_lyubit_redis@localhost:6379");
        assert_eq!(config.matches_url, "http://localhost:8005");
        assert_eq!(config.user_url, "http://localhost:8001");
        assert_eq!(config.tickets_url, "http://localhost:8006");

        // создаем обработчик очереди
        let _queue_processor = QueueService::new(&config).await;
    }

    

    #[tokio::test]
    async fn redis_service_test() {
        init_logging();
        const MATCH_ID: &str = "test_match_id_1";

        let config = Config::from_toml();
        let redis_service = RedisService::new(config.redis_url).await;
        let mut client = redis_service.get_client().await;
        let _: () = client.del(&MATCH_ID.to_string()).await.unwrap();
        info!("deleted ZSET with match_id: {}", MATCH_ID);

        let queue = redis_service.get_users_from_queue(&MATCH_ID.to_string()).await;
        assert!(queue.is_ok());
        assert_eq!(queue.unwrap().len(), 0);

        let data = QueueModel {
            min_price: 100,
            max_price: 1000,
            email: "test_email".to_string(),
            user_id: "test_user_id".to_string(),
        };
        let cloned_data = data.clone();
        
        let res = redis_service.add_to_queue(MATCH_ID.to_string(), data).await;
        assert!(res.is_ok());

        let queue = redis_service.get_users_from_queue(&MATCH_ID.to_string()).await;
        assert!(queue.is_ok());

        let queue = queue.unwrap();
        assert_eq!(queue.len(), 1);
        assert_eq!(queue[0], cloned_data);

        let res = redis_service.delete_from_queue(MATCH_ID, cloned_data.user_id.clone()).await;
        assert!(res.is_ok());

        let queue = redis_service.get_users_from_queue(&MATCH_ID.to_string()).await;
        assert!(queue.is_ok());
        assert_eq!(queue.unwrap().len(), 0);
    }

    #[tokio::test]
    async fn kafka_service_test() {
        init_logging();
        const MATCH_ID: &str = "test_match_id_2";

        let config = Config::from_toml();
        let kafka_service = KafkaService::new(config.kafka_url.as_str()).await;

        let res = kafka_service.create_topic("test_topic".to_string()).await;
        assert!(res.is_ok());

        info!("Sending message 1");
        let res = kafka_service.safe_send_msg::<TicketInfo>(TicketInfo {
            ticket_id: "test_ticket_id".to_string(),
            match_id: MATCH_ID.to_string(),
            price: 100,
        }, "test_topic", "test_message").await;
        assert!(res.is_ok());



    }

    #[tokio::test]
    async fn api_add_event_test() {
        init_logging();

        const MAIN_URL: &str = "http://localhost:8020";
        const MATCH_ID: &str = "test_match_id_3";


        let client = reqwest::Client::new();

        // Неправильный запрос
        let res = client.get(format!("{}/event", MAIN_URL)).send().await;
        assert!(res.is_ok());
        assert_eq!(res.unwrap().status(), StatusCode::NOT_FOUND);

        // Запрос без тела (неправильный)
        let res = client.post(format!("{}/event", MAIN_URL)).send().await;
        assert!(res.is_ok());
        assert_eq!(res.unwrap().status(), StatusCode::BAD_REQUEST);

        // Запрос с правильным телом
        let body = json!({
            "ticket_id": "test_ticket_id",
            "match_id": MATCH_ID,
            "price": 100,
        });

        let res = client.post(format!("{}/event", MAIN_URL)).json(&body).send().await;
        assert!(res.is_ok());
        assert_eq!(res.unwrap().status(), StatusCode::OK);

        // Запрос с неправильным match_id
        let body = json!({
            "ticket_id": "test_ticket_id",
            "match_id": "вцвфвф",
            "price": 100,
        });

        let res = client.post(format!("{}/event", MAIN_URL)).json(&body).send().await;
        assert!(res.is_ok());

        // Запрос с неправильным match_id
        let body = json!({
            "ticket_id": "test_ticket_id",
            "match_id": "вцвфвф",
            "price": -100,
        });
        let res = client.post(format!("{}/event", MAIN_URL)).json(&body).send().await;
        assert!(res.is_ok());
        assert!(res.unwrap().status() == StatusCode::BAD_REQUEST);
    }

    #[tokio::test]
    async fn api_pipeline_2() {
        const MATCH_ID: &str = "test_match_id_4";
        init_logging();
        let config = Config::from_toml();
        let redis_service = RedisService::new(config.redis_url).await;
        let mut client = redis_service.get_client().await;
        let _: () = client.del(&MATCH_ID.to_string()).await.unwrap();
        info!("deleted ZSET with match_id: {}", MATCH_ID);

        const MAIN_URL: &str = "http://localhost:8020";

        let client = reqwest::Client::new();

        // Правильный запрос
        let res = client.get(format!("{}/queue/{}", MAIN_URL, MATCH_ID)).send().await;
        assert!(res.is_ok());
        assert_eq!(res.unwrap().status(), StatusCode::OK);

        // Неправильный запрос
        let res = client.post(format!("{}/queue/{}", MAIN_URL, MATCH_ID)).send().await;
        assert!(res.is_ok());
        assert_eq!(res.unwrap().status(), StatusCode::NOT_FOUND);

        // Правильный запрос
        let res = client.get(format!("{}/queue/{}", MAIN_URL, MATCH_ID)).send().await;
        assert!(res.is_ok());
        assert_eq!(res.unwrap().status(), StatusCode::OK);

        // Добавляем пользователя в очередь
        let body = json!({
            "user_id": "test_user_id",
            "min_price": 100,
            "max_price": 1000,
            "email": "test_email",
        });

        let res = client.post(format!("{}/user/{}", MAIN_URL, MATCH_ID)).json(&body).send().await;
        assert!(res.is_ok());
        assert_eq!(res.unwrap().status(), StatusCode::OK);


        // Получаем очередь
        let res = client.get(format!("{}/queue/{}", MAIN_URL, MATCH_ID)).send().await;
        assert!(res.is_ok());
        let res = res.unwrap();
        assert_eq!(res.status(), StatusCode::OK);
        let res = res.json::<Vec<QueueModel>>().await;
        assert!(res.is_ok());
        let res = res.unwrap();
        assert_eq!(res.len(), 1);

        // Удаляем пользователя из очереди
        let res = client.delete(format!("{}/user/{}/{}", MAIN_URL, MATCH_ID, "test_user_id".to_string())).send().await;
        assert!(res.is_ok());
        assert_eq!(res.unwrap().status(), StatusCode::OK);

        // Получаем очередь
        let res = client.get(format!("{}/queue/{}", MAIN_URL, MATCH_ID)).send().await;
        assert!(res.is_ok());
        let res = res.unwrap();
        assert_eq!(res.status(), StatusCode::OK);
        let res = res.json::<Vec<QueueModel>>().await;
        assert!(res.is_ok());
        let res = res.unwrap();
        assert_eq!(res.len(), 0);
    }

    #[tokio::test]
    async fn polling_test() {
        const MATCH_ID: &str = "test_match_id_5";
        // Добавляю двух пользователей в очередь
        // Запускаю polling
        // выкладываю билеты 
        // проверяю, что первый пользователь получил билет, а второй нет
        // проверяю, что очередь состоит из одного пользователя
        init_logging();

        let config = Config::from_toml();
        let redis_service = RedisService::new(config.redis_url).await;
        let mut client = redis_service.get_client().await;
        let _: () = client.del(&MATCH_ID.to_string()).await.unwrap();
        info!("deleted ZSET with match_id: {}", MATCH_ID);


        const MAIN_URL: &str = "http://localhost:8020";

        let config = Config::from_toml();
        let queue_service = QueueService::new(&config).await;
        let client = reqwest::Client::new();

        // Запускаю polling
        tokio::spawn(async move {
            queue_service.start_polling().await;
        });

        // Добавляю двух пользователей в очередь
        let body = json!({
            "user_id": "test_user_id",
            "min_price": 300,
            "max_price": 500,
            "email": "test_email",
        });

        let res = client.post(format!("{}/user/{}", MAIN_URL, MATCH_ID)).json(&body).send().await;
        assert!(res.is_ok());
        assert_eq!(res.unwrap().status(), StatusCode::OK);

        let body = json!({
            "user_id": "test_user_id_2",
            "min_price": 600,
            "max_price": 1000,
            "email": "test_email_2",
        });

        let res = client.post(format!("{}/user/{}", MAIN_URL, MATCH_ID)).json(&body).send().await;
        assert!(res.is_ok());
        assert_eq!(res.unwrap().status(), StatusCode::OK);

        // Проверяю, что очередь состоит из двух пользователей
        let res = client.get(format!("{}/queue/{}", MAIN_URL, MATCH_ID)).send().await;
        assert!(res.is_ok());
        let res = res.unwrap();
        assert_eq!(res.status(), StatusCode::OK);
        let res = res.json::<Vec<QueueModel>>().await;
        assert!(res.is_ok());
        let res = res.unwrap();
        assert_eq!(res.len(), 2);

        let body = json!({
            "ticket_id": "test_ticket_id",
            "match_id": MATCH_ID,
            "price": 400,
        });
        // Выкладываю билеты
        let res = client.post(format!("{}/event", MAIN_URL)).json(&body).send().await;
        assert!(res.is_ok());
        assert_eq!(res.unwrap().status(), StatusCode::OK);

        tokio::time::sleep(std::time::Duration::from_secs(4)).await;

        // Проверяю, что первый пользователь получил билет, а второй нет
        let res = client.get(format!("{}/queue/{}", MAIN_URL, MATCH_ID)).send().await;
        assert!(res.is_ok());
        let res = res.unwrap();
        assert_eq!(res.status(), StatusCode::OK);
        let res = res.json::<Vec<QueueModel>>().await;
        assert!(res.is_ok());
        let res = res.unwrap();
        info!("res: {:?}", res);
        assert_eq!(res.len(), 1);
        assert_eq!(res[0].user_id, "test_user_id_2");
    }
}