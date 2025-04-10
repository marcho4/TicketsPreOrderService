use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, Clone, ToSchema)]
pub struct JwtClaims {
    pub user_id: String,
    pub auth_id: String,
    pub role: Role,
    pub exp: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone, ToSchema)]
pub struct Jwt {
    pub jwt: String,
}


#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, ToSchema)]
pub struct MessageResp {
    pub message: String,
}


#[derive(Debug, Serialize, Deserialize, Clone, ToSchema)]
pub struct ApiResponse<T> {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub msg: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>
}

#[derive(Deserialize, ToSchema)]
pub struct Empty {}

#[derive(Debug, PartialEq, Serialize, Deserialize, Clone, ToSchema)]
pub enum Role {
    ADMIN,
    ORGANIZER,
    USER
}