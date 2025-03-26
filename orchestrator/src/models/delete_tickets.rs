use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, ToSchema)]
pub struct DeleteTickets {
    pub ticket_ids: Vec<String>
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, ToSchema)]
pub struct DeleteTicketsResp {
    pub message: String,
    pub deleted_tickets: i32,
    pub all_tickets: i32,
}

