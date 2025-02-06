use crate::models::roles::Role;
use serde::{Deserialize, Serialize};

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