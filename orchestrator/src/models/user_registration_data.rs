use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, ToSchema)]
pub struct UserRegistrationData {
    pub name: String,
    pub last_name: String,
    pub email: String,
    pub login: String,
    pub password: String,
    pub user_id: String,
}