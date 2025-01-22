use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Default, Serialize, Deserialize)]
pub struct OrganizerInfo {
    pub phone_number: String,
    pub email: String,
    pub tin: String,
    pub organization_name: String,
}