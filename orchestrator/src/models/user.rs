use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use crate::models::general::Role;

#[derive(Deserialize, Debug, Clone, Serialize, ToSchema)]
pub struct UserResp {
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<User>
}

#[derive(Deserialize, Debug, Clone, Serialize, ToSchema)]
pub struct User {
    pub birthday: String,
    pub email: String,
    pub id: String,
    pub last_name: String,
    pub name: String,
    pub phone: String,
}

#[derive(Deserialize, Debug, Clone, Serialize, ToSchema)]
pub struct UserCreateData {
    pub email: String,
    pub name: String,
    pub last_name: String,
    pub phone: String,
    pub birthday: String,
}

#[derive(Deserialize, Debug, Clone, Serialize, ToSchema)]
pub struct UserUpdateData {
    pub email: String,
    pub name: String,
    pub last_name: String,
    pub birthday: String,
    #[serde(rename(deserialize = "phone"))]
    pub phone_number: String,
}

#[derive(Deserialize, Debug, Clone, Serialize, ToSchema)]
pub struct UserRegistration {
    pub email: String,
    pub password: String,
    pub login: String,
    pub name: String,
    pub last_name: String,
    pub birthday: String,
    pub phone: String,
}


#[derive(Serialize, Deserialize, ToSchema)]
pub struct UserRegistrationData {
    pub name: String,
    pub last_name: String,
    pub email: String,
    pub login: String,
    pub password: String,
    pub user_id: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, ToSchema)]
pub struct UserInfo {
    pub user_id: String,
    pub auth_id: String,
    pub role: Role
}

#[derive(Clone, Debug, PartialEq, Default, Serialize, Deserialize, ToSchema)]
pub struct RegistrationUserResp {
    pub email: String,
    pub last_name: String,
    pub name: String,
    pub password: String,
    pub status: String,
}

