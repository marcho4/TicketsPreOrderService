use serde::{ Serialize, Deserialize};
use utoipa::ToSchema;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, ToSchema)]
pub struct PasswordUpdate {
    pub password: String,
}