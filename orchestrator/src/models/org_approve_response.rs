use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, ToSchema)]
pub struct OrgApproveResponse {
    pub login: String,
    pub password: String,
    pub message: String,
    pub status: String,
}
