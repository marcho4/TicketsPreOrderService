use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug, Clone, Serialize)]
pub struct UserResp {
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<User>
}

#[derive(Deserialize, Debug, Clone, Serialize)]
pub struct User {
    pub birthday: String,
    pub email: String,
    pub id: String,
    pub last_name: String,
    pub name: String,
    pub phone: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
pub struct UserCreateData {
    pub email: String,
    pub name: String,
    pub last_name: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
pub struct UserUpdateData {
    pub email: String,
    pub name: String,
    pub last_name: String,
    pub birthday: String,
    pub phone_number: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
pub struct UserRegistration {
    pub email: String,
    pub password: String,
    pub login: String,
    pub name: String,
    pub last_name: String,
}