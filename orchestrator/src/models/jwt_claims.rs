use serde::{Deserialize, Serialize};
use crate::models::roles::Role;
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JwtClaims {
    pub id: String,
    pub role: Role,
    pub exp: isize,
}