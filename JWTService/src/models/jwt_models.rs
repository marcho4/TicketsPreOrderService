use rocket::serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct JWTPayload {
    pub wallet: String
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JWTResponse {
    pub jwt: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub id: i32,
    pub role: String,
    pub exp: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub msg: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>
}