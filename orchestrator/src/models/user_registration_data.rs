use serde::{ Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct UserRegistrationData {
    pub name: String,
    pub last_name: String,
    pub email: String,
}