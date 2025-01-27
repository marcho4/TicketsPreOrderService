use std::env;
use dotenv::dotenv;
use jsonwebtoken::{DecodingKey, EncodingKey, Header};
use jsonwebtoken::errors::Error;
use crate::models::claims::Claims;
use crate::models::jwt_payload::JWTPayload;

const HOUR: u64 = 3600;

pub fn create_jwt(payload: JWTPayload) -> String {
    let current_timestamp = jsonwebtoken::get_current_timestamp();
    let sec = env::var("JWT").expect("JWT_SECRET must be set in .env file");
    let key: EncodingKey = EncodingKey::from_secret(sec.as_bytes());

    let claims = Claims {
        id: payload.id,
        exp: current_timestamp + HOUR,
        role: payload.role,
    };

    jsonwebtoken::encode(&Header::default(), &claims, &key).unwrap()
}

pub fn decode_jwt(jwt: String) -> Result<Claims, Error> {
    let sec: String = dotenv::var("JWT").unwrap();
    let key: DecodingKey = DecodingKey::from_secret(sec.as_bytes());
    let decoded = jsonwebtoken::decode::<Claims>(jwt.as_str(), &(key), &Default::default());
    match decoded {
        Ok(token_data) => Ok(token_data.claims),
        Err(e) => Err(e),
    }
}