use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct UserRegistrationData {
    pub name: String,
    pub last_name: String,
    pub email: String,
    pub login: String,
    pub password: String,
    pub user_id: String,
}