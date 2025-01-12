use serde::{ Serialize, Deserialize };

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct OrganizerRegistrationData {
    pub company: String,
    pub email: String,
    pub TIN: String,
}