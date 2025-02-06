use crate::models::api_response::ApiResponse;
use crate::models::jwt::Jwt;
use crate::models::jwt_claims::JwtClaims;
use crate::orchestrator::orchestrator::Orchestrator;
use actix_web::{get, web, HttpRequest, HttpResponse};
use actix_web::http::StatusCode;
use chrono::Utc;
use crate::utils::responses::generic_response;

#[get("/session")]
pub async fn session(req: HttpRequest, orchestrator: web::Data<Orchestrator>) -> HttpResponse {
    let cookie = req.cookie("token");
    if cookie.is_none() {
        return generic_response::<String>(
            StatusCode::UNAUTHORIZED,
            Some("Token not found".to_string()),
            None
        );
    };
    let cookie_value = cookie.unwrap().value().to_string();

    let jwt_url = "http://jwt:8001/jwt/decode";
    let jwt_data = Jwt { jwt: cookie_value };

    let res = orchestrator.client.post(jwt_url).json(&jwt_data).send().await;

    match res {
        Ok(response) => {
            match response.json::<ApiResponse<JwtClaims>>().await {
                Ok(data) => {
                    let claims = match data.data {
                        Some(claims) => claims,
                        None => {
                            return generic_response::<String>(
                                StatusCode::UNAUTHORIZED,
                                Some("Wrong JWT".to_string()),
                                data.msg
                            );
                        }
                    };
                    // Проверка на просроченность токена
                    if claims.exp < Utc::now().timestamp() as isize {
                        return generic_response::<String>(
                            StatusCode::INTERNAL_SERVER_ERROR,
                            Some("JWT expired".to_string()),
                            None
                        );
                    };
                    generic_response::<JwtClaims>(
                        StatusCode::OK,
                        Some("Success".to_string()),
                        Some(claims)
                    )
                },
                Err(e) => generic_response::<String>(
                    StatusCode::BAD_REQUEST,
                    Some(e.to_string()),
                    None
                )
            }
        },
        Err(e) => generic_response::<String>(
            StatusCode::INTERNAL_SERVER_ERROR,
            Some(e.to_string()),
            None
        ),
    }
}