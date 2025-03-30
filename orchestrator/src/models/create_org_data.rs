use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct CreateOrgData {
    pub tin: String,
    pub email: String,
    pub organization_name: String,
    pub phone_number: String,
}