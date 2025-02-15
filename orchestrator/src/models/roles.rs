use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize, Clone)]
pub enum Role {
    ADMIN,
    ORGANIZER,
    USER
}