use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum Status {
    APPROVED,
    REJECTED,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RequestProcessInfo {
    pub request_id: String,
    pub status: Status,
}