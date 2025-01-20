use rocket::serde::{Deserialize, Serialize};
use crate::models::roles::Role;

#[derive(Debug, Serialize, Deserialize)]
pub struct JWTPayload {
    pub id: String,
    pub role: Role
}



