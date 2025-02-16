use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct Ticket {
    pub id: String,
    pub match_id: String,
    pub price: String,
    pub row: String,
    pub seat: String,
    pub sector: String,
    pub status: TicketStatus,
    pub user_id: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema, PartialEq)]
pub enum TicketStatus {
    #[serde(rename = "available")]
    Available,
    #[serde(rename = "reserved")]
    Reserved,
    #[serde(rename = "sold")]
    Sold
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct TicketsAddResponse {
    pub message: String,
    pub invalid_rows: i32
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct CancelData {
    pub user_id: String,
    pub ticket_id: String
}