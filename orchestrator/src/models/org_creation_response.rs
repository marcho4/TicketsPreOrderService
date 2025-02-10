use crate::models::roles::Role;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct OrgCreationResponse {
    pub message: String,
    pub status: String,
    pub data: OrgId,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct OrgId {
    pub id: String,
    pub role: Role
}