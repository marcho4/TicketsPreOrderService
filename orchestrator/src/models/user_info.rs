use crate::models::roles::Role;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, ToSchema)]
pub struct UserInfo {
    pub user_id: String,
    pub auth_id: String,
    pub role: Role
}