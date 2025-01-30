use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OrgApproveResponse {
    pub login: String,
    pub password: String,
    pub message: String,
    pub status: String,
}
