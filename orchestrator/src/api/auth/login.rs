use actix_web::{post, web, HttpResponse, Result};
use crate::models::api_response::ApiResponse;
use crate::models::jwt::Jwt;
use crate::models::jwt_claims::JwtClaims;
use crate::models::login_data::LoginData;
use crate::orchestrator::orchestrator::Orchestrator;

#[post("/login")]
pub async fn login(data: web::Data<Orchestrator>, req_data: web::Json<LoginData>) -> Result<HttpResponse> {
    // Подготовка данных
    let login_data = req_data.into_inner();
    let req_url = format!("{}/authorize", data.config.auth_base_url);

    // 1. Запрашиваем авторизацию в auth-сервисе
    let auth_response = match data.client.post(&req_url).json::<LoginData>(&login_data).send().await {
        Ok(r) => r,
        Err(e) => {
            // Ошибка сети / подключения
            return Ok(HttpResponse::InternalServerError().json(ApiResponse::<String> {
                msg: Some("Failed to send request to auth service".to_string()),
                data: Some(e.to_string()),
            }));
        }
    };

    // 2. Проверяем, что сервис авторизации ответил успешным кодом статуса
    if !auth_response.status().is_success() {
        return Ok(HttpResponse::Unauthorized().json(ApiResponse::<String> {
            msg: Some(format!(
                "Authorization failed. Status: {}",
                auth_response.status()
            )),
            data: None,
        }));
    }

    // 3. Парсим тело ответа от сервиса авторизации
    //    Предполагаем, что в теле приходит ApiResponse<JwtClaims>
    let auth_body = match auth_response.json::<ApiResponse<JwtClaims>>().await {
        Ok(json) => json,
        Err(e) => {
            return Ok(HttpResponse::InternalServerError().json(ApiResponse::<String> {
                msg: Some("Failed to parse auth response as ApiResponse<JwtClaims>".to_string()),
                data: Some(e.to_string()),
            }));
        }
    };

    // 4. Проверяем, что в data действительно что-то пришло
    let jwt_claims = match auth_body.data {
        Some(claims) => claims,
        None => {
            return Ok(HttpResponse::InternalServerError().json(ApiResponse::<String> {
                msg: Some("Auth service returned empty data".to_string()),
                data: None,
            }));
        }
    };

    // 5. Теперь генерируем JWT, отправляя jwt_claims на другой сервис (jwt-сервис)
    let jwt_url = format!("{}/generate", data.config.jwt_base_url);
    let jwt_gen_response = match data.client.post(&jwt_url).json(&jwt_claims).send().await {
        Ok(r) => r,
        Err(e) => {
            // Ошибка сети / подключения при запросе к jwt-сервису
            return Ok(HttpResponse::InternalServerError().json(ApiResponse::<String> {
                msg: Some("Failed to send request to JWT service".to_string()),
                data: Some(e.to_string()),
            }));
        }
    };

    // 6. Проверяем код статуса
    if !jwt_gen_response.status().is_success() {
        return Ok(HttpResponse::InternalServerError().json(ApiResponse::<String> {
            msg: Some(format!(
                "JWT service returned error. Status: {}",
                jwt_gen_response.status()
            )),
            data: None,
        }));
    }

    // 7. Парсим тело ответа от jwt-сервиса
    let jwt = match jwt_gen_response.json::<Jwt>().await {
        Ok(body) => body,
        Err(e) => {
            return Ok(HttpResponse::InternalServerError().json(ApiResponse::<String> {
                msg: Some("Failed to parse JWT service response".to_string()),
                data: Some(e.to_string()),
            }));
        }
    };

    // 8. Возвращаем результат
    Ok(HttpResponse::Ok().json(ApiResponse {
        msg: Some("Successfully authorized".to_string()),
        data: Some(jwt),
    }))
}