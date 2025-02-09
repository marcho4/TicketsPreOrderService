use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct OrganizerRegistrationData {
    pub company: String,
    pub email: String,
    pub tin: String,
}