use serde::{ Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CreateOrgData {
    pub tin: String,
    pub email: String,
    pub organization_name: String,
}