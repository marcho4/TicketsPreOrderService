use dotenv::{ from_filename };
use std::env;
use serde::Deserialize;

/// <strong>Основные настройки оркестратора</strong></br>
/// Здесь должны быть прописаны все базовые ссылки на микросервисы для удобного обращения к ним</br>
/// Конфиг должен заполняться из .env файла при инициализации структуры Оркестратора
#[derive(Debug, Clone, Deserialize)]
pub struct Config {
    pub frontend_url: String,
    pub main_url: String,
    pub auth_url: String,
    pub jwt_url: String,
    pub admin_url: String,
    pub organizer_url: String,
}
