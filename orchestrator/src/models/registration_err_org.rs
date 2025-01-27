use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Default, Serialize, Deserialize)]
pub struct RegistrationErrorOrg {
    pub status: String,
    pub message: String,
}