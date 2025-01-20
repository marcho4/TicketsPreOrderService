use reqwest::Client;
use crate::orchestrator::config::Config;

pub struct Orchestrator {
    pub client: Client, // Клиент reqwest для обращения к другим микросервисам
    pub config: Config, // Конфиг для удобной работы с оркестратором
}

// TODO: Добавить парсинг dotenv файла и заполнять конфиг из него
impl Orchestrator {
    pub fn new() -> Orchestrator {
        Orchestrator {
            client: Client::new(),
            // Потом добавлю обработку .env для заполнения конфига
            config: Config {
                frontend_url: "http://localhost:3000".to_string(),
                base_url: "http://localhost:8000".to_string(),
                auth_base_url: "http://auth:8002".to_string(),
                jwt_base_url: "http://jwt:8001".to_string(),
            }
        }
    }
}