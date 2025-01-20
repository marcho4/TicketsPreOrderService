use::rocket::{post};
use jsonwebtoken::{DecodingKey, EncodingKey, Header};
use jsonwebtoken::errors::Error;
use rocket::serde::json::Json;
use crate::models::*;
use rocket::http::{Status};
use crate::models::api_response::ApiResponse;
use crate::models::claims::Claims;
use super::jwt_functions::*;


#[post("/jwt/generate", data = "<data>")]
pub fn generate_jwt(data: Json<jwt_payload::JWTPayload>) -> (Status, Json<jwt_response::JWTResponse>) {
    let wallet = data.into_inner();
    let jwt = create_jwt(wallet);
    (Status::Created, Json(jwt_response::JWTResponse { jwt }))
}

#[post("/jwt/decode", data = "<data>")]
pub fn verify_jwt(data: Json<jwt_response::JWTResponse>) -> (Status, Json<ApiResponse<Claims>>) {
    let jwt = data.jwt.to_owned();

    match decode_jwt(jwt) {
        Ok(claims) => (Status::Ok, Json(ApiResponse {
            msg: Option::from("Decoded successfully".to_string()),
            data: Some(claims)
        })),
        Err(_) => (Status::BadRequest, Json(ApiResponse {
            msg: Option::from("Wrong JWT token, can't decode it".to_string()),
            data: None
        })),
    }
}
