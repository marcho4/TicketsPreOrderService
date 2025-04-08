use std::env;
use crate::models::general::JwtClaims;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::errors::OrchestratorError;
use jsonwebtoken::{DecodingKey, EncodingKey, Header};
use crate::models::user::UserInfo;

const HOUR: u64 = 3600;
impl Orchestrator {
    pub async fn decode_jwt(&self, jwt: String) -> Result<JwtClaims, OrchestratorError> {
        let key: DecodingKey = DecodingKey::from_secret(self.jwt_key.as_bytes());
        let decoded = jsonwebtoken::decode::<JwtClaims>(jwt.as_str(), &(key), &Default::default());
        match decoded {
            Ok(token_data) => Ok(token_data.claims),
            Err(_) => Err(OrchestratorError::Service("Error decoding jwt".to_string())),
        }
    }
    pub async fn generate_jwt(&self, payload: &UserInfo) -> Result<String, OrchestratorError> {
        let current_timestamp = jsonwebtoken::get_current_timestamp();
        let sec = env::var("JWT").expect("JWT_SECRET must be set in .env file");
        let key: EncodingKey = EncodingKey::from_secret(sec.as_bytes());

        let claims = JwtClaims {
            user_id: payload.user_id.clone(),
            auth_id: payload.auth_id.clone(),
            role: payload.role.clone(),
            exp: current_timestamp + HOUR,
        };

        Ok(jsonwebtoken::encode(&Header::default(), &claims, &key).unwrap())
    }
}
