use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, PartialEq, Serialize, Deserialize, Clone, ToSchema)]
pub enum Role {
    ADMIN,
    ORGANIZER,
    USER
}