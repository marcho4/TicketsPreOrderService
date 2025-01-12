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