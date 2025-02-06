use crate::models::roles::Role;
use serde::{Deserialize, Serialize};
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JwtClaims {
    pub id: String,
    pub role: Role,
    pub exp: isize,
}