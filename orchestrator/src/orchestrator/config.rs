use dotenv::{ from_filename };
use std::env;


/// <strong>Основные настройки оркестратора</strong></br>
/// Здесь должны быть прописаны все базовые ссылки на микросервисы для удобного обращения к ним</br>
/// Конфиг должен заполняться из .env файла при инициализации структуры Оркестратора
#[derive(Debug, Clone)]
pub struct Config {
    pub frontend_url: String,
    pub base_url: String,
    pub auth_base_url: String,
    pub jwt_base_url: String
}

impl Config {
    pub fn new_dev() -> Self {
        from_filename("/src/orchestrator/.env.dev").ok();

        let frontend_url = env::var("FRONTEND_URL")
            .unwrap_or("http://localhost:3000".to_string());
        let base_url = env::var("BASE_URL").unwrap();
        let auth_base_url = env::var("AUTH_BASE_URL").unwrap();
        let jwt_base_url = env::var("JWT_BASE_URL").unwrap();

        Config {frontend_url, base_url, auth_base_url, jwt_base_url}
    }

    pub fn new_prod() -> Self {
        from_filename("/src/orchestrator/.env.prod").ok();

        let frontend_url = env::var("FRONTEND_URL")
            .unwrap_or("http://localhost:3000".to_string());
        let base_url = env::var("BASE_URL").unwrap();
        let auth_base_url = env::var("AUTH_BASE_URL").unwrap();
        let jwt_base_url = env::var("JWT_BASE_URL").unwrap();

        Config {frontend_url, base_url, auth_base_url, jwt_base_url}
    }
}