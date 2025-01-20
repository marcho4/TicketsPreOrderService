use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct RegistrationOrgResp {
    login: String,
    password: String,
    status: String,
}