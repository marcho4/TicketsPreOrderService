use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Clone, Debug, PartialEq, Default, Serialize, Deserialize, ToSchema)]
pub struct LoginData {
    pub login: String,
    pub password: String,
}