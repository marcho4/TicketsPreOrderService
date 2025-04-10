use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, ToSchema)]
pub struct AdminRequest {
    pub email: String,
    pub company: String,
    pub tin: String,
    pub phone_number: String,
    pub request_id: String,
}


#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, ToSchema)]
pub enum Status {
    APPROVED,
    REJECTED,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, ToSchema)]
pub struct RequestProcessInfo {
    pub request_id: String,
    pub status: Status,
}