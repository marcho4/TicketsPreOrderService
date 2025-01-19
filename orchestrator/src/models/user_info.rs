use serde::{Deserialize, Serialize};
use crate::models::roles::Role;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct UserInfo {
    pub id: String,
    pub role: Role
}