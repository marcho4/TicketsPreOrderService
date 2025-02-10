use crate::models::roles::Role;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, Clone, ToSchema)]
pub struct JwtClaims {
    pub user_id: String,
    pub auth_id: String,
    pub role: Role,
    pub exp: u64,
}