use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Clone, Debug, PartialEq, Default, Serialize, Deserialize, ToSchema)]
pub struct RegistrationUserResp {
    pub email: String,
    pub last_name: String,
    pub name: String,
    pub password: String,
    pub status: String,
}