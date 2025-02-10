use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Clone, Debug, PartialEq, Default, Serialize, Deserialize, ToSchema)]
pub struct RegistrationErrorOrg {
    pub status: String,
    pub message: String,
}