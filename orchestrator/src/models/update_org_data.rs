use serde::{ Serialize, Deserialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UpdateOrgData {
    pub organization_name: String,
    pub email: String,
    pub phone_number: String,
}