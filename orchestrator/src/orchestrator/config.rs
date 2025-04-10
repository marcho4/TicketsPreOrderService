use serde::Deserialize;

/// <strong>Основные настройки оркестратора</strong></br>
/// Здесь должны быть прописаны все базовые ссылки на микросервисы для удобного обращения к ним</br>
/// Конфиг должен заполняться из .env файла при инициализации структуры Оркестратора
#[derive(Debug, Clone, Deserialize)]
pub struct Config {
    pub frontend_url: String,
    pub auth_url: String,
    pub admin_url: String,
    pub organizer_url: String,
    pub user_url: String,
    pub matches_url: String,
    pub tickets_url: String,
    pub kafka_url: String,
    pub queue_url: String,
    pub payment_url: String,
}
