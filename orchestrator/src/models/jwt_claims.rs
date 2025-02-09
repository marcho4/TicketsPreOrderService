use crate::models::roles::Role;
use serde::{Deserialize, Serialize};
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JwtClaims {
    pub user_id: String,
    pub auth_id: String,
    pub role: Role,
    pub exp: u64,
}