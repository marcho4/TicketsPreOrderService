use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, ToSchema)]
pub struct AdminRequest {
    pub email: String,
    pub company: String,
    pub tin: String,
    pub request_id: String,
}