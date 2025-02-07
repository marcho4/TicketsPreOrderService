use crate::models::roles::Role;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct UserInfo {
    pub user_id: String,
    pub auth_id: String,
    pub role: Role
}