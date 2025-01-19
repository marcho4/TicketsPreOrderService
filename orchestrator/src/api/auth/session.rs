use actix_web::{get, web, HttpRequest, HttpResponse};
use crate::models::api_response::ApiResponse;
use crate::models::jwt::Jwt;
use crate::orchestrator::orchestrator::Orchestrator;
use chrono::Utc;
use crate::models::jwt_claims::JwtClaims;

#[get("/session")]
pub async fn session(req: HttpRequest, orch: web::Data<Orchestrator>) -> HttpResponse {
    let cookie = req.cookie("token");
    if let Some(cookie) = cookie {
        let cookie_value = cookie.value().to_string();

        let jwt_url = "http://jwt:8001/jwt/decode";
        let jwt_data = Jwt {jwt: cookie_value};

        let request = orch.client.post(jwt_url).json(&jwt_data);
        let res = request.send().await;

        match res {
            Ok(response) => {
                let data = match response.json::<ApiResponse<JwtClaims>>().await {
                    Ok(data) => {
                        let claims = match data.data {
                            Some(claims) => claims,
                            None => {
                                return HttpResponse::Unauthorized().json(ApiResponse::<String> {
                                    msg: Option::from("Wrong JWT".to_string()),
                                    data: data.msg
                                });
                            }
                        };
                        claims
                    },
                    Err(e) => {
                        return HttpResponse::InternalServerError().json(ApiResponse::<String> {
                                msg: Option::from(e.to_string()),
                                data: None}
                        )
                    }
                };

                // Проверка на просроченность jwt токена
                if data.exp < Utc::now().timestamp() as isize {
                    return HttpResponse::InternalServerError().json(ApiResponse::<String> {
                        msg: Option::from("Your JWT has been expired".to_string()),
                        data: None,
                    })
                };

                HttpResponse::Ok().json(ApiResponse::<JwtClaims> {
                    msg: Option::from("Success".to_string()),
                    data: Option::from(data)
                })

            },
            Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<String> {
                msg: Option::from(e.to_string()),
                data: None
            }),
        }
    } else {
        HttpResponse::Unauthorized().json(
            ApiResponse::<String> {
                msg: Option::from(String::from("Token Not Found")),
                data: None
            }
        )
    }
}
