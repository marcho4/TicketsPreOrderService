use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UpdateOrgData {
    pub organization_name: String,
    pub email: String,
    pub phone_number: String,
    pub tin: String
}