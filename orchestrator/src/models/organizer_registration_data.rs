use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct OrganizerRegistrationData {
    pub company: String,
    pub email: String,
    pub tin: String,
    pub phone_number: String,
}