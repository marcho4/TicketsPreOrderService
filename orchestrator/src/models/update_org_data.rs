use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, Clone, Debug, ToSchema)]
pub struct UpdateOrgData {
    pub organization_name: String,
    pub email: String,
    pub phone_number: String,
    pub tin: String
}