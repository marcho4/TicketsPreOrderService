use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Default, Serialize, Deserialize)]
pub struct RegistrationUserResp {
    pub email: String,
    pub last_name: String,
    pub name: String,
    pub password: String,
    pub status: String,
}