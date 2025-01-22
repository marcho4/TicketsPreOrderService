use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct AdminRequest {
    pub email: String,
    pub company: String,
    pub tin: String,
    pub request_id: String,
}