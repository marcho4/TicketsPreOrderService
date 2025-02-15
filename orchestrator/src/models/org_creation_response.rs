use serde::{Deserialize, Serialize};
use crate::models::roles::Role;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct OrgCreationResponse {
    pub message: String,
    pub status: String,
    pub data: OrgId,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct OrgId {
    pub id: String,
    pub role: Role
}