use rocket::serde::{Deserialize, Serialize};
use crate::models::roles::Role;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub id: String,
    pub role: Role,
    pub exp: u64,
}
