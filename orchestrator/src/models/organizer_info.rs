use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Clone, Debug, PartialEq, Default, Serialize, Deserialize, ToSchema)]
pub struct OrganizerInfo {
    pub phone_number: String,
    pub email: String,
    pub tin: String,
    pub organization_name: String,
}