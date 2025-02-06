use crate::models::api_response::ApiResponse;
use crate::models::jwt::Jwt;
use crate::models::login_data::LoginData;
use crate::models::user_info::UserInfo;
use crate::orchestrator::orchestrator::Orchestrator;
use actix_web::cookie::time::Duration;
use actix_web::cookie::{Cookie, SameSite};
use actix_web::{post, web, HttpResponse};
use actix_web::http::StatusCode;
use crate::utils::responses::generic_response;

#[post("/login")]
pub async fn login(orchestrator: web::Data<Orchestrator>, req_data: web::Json<LoginData>) -> HttpResponse {
    let login_data = req_data.into_inner();

    let resp = match orchestrator.authorize(&login_data).await {
        Ok(r) => r,
        Err(e) => return
            generic_response::<String>(StatusCode::INTERNAL_SERVER_ERROR, Some(e.to_string()), None)
    };

    let jwt_url = format!("{}/jwt/generate", orchestrator.config.jwt_url);
    let jwt_gen_response = match orchestrator.client.post(&jwt_url).json(&resp).send().await {
        Ok(r) => r,
        Err(e) => {
            // Ошибка сети / подключения при запросе к jwt-сервису
            return HttpResponse::InternalServerError().json(ApiResponse::<String> {
                msg: Some("Failed to send request to JWT service".to_string()),
                data: Some(e.to_string()),
            });
        }
    };

    // 6. Проверяем код статуса
    if !jwt_gen_response.status().is_success() {
        return HttpResponse::InternalServerError().json(ApiResponse::<String> {
            msg: Some(format!(
                "JWT service returned error. Status: {}",
                jwt_gen_response.status()
            )),
            data: None,
        });
    }

    // 7. Парсим тело ответа от jwt-сервиса
    let jwt = match jwt_gen_response.json::<Jwt>().await {
        Ok(body) => body,
        Err(e) => {
            return generic_response::<String>
                (StatusCode::INTERNAL_SERVER_ERROR, Some(e.to_string()), None);
        }
    };

    let cookie = Cookie::build("token", jwt.jwt.clone())
        .path("/")
        .max_age(Duration::seconds(3600))
        .same_site(SameSite::Strict)
        .finish();

    HttpResponse::Ok().cookie(cookie).json(ApiResponse::<UserInfo> {
        msg: Some("Successfully authorized".to_string()),
        data: Some(resp),
    })
}