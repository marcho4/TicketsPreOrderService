use serde::{Deserialize, Serialize};

// Модель события о появлении билета в наличии в кафка топике
#[derive(Serialize, Deserialize, Debug)]
pub struct TicketInfo {
    pub ticket_id: String,
    pub match_id: String,
    pub price: i64
}

// Модель для хранения данных в редисе в очереди
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct QueueModel {
    pub user_id: String,
    pub min_price: i64,
    pub max_price: i64,
    pub email: String,
}


// Для API вызова резервации билета
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TicketReservation {
    pub user_id: String,
    pub match_id: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MessageResp {
    pub message: String,
}

use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum EmailTemplates {
    #[serde(rename = "registration-success")]
    RegistrationSuccess,
    #[serde(rename = "organizer-approval")]
    OrganizerApproval,
    #[serde(rename = "ticket-preorder-success")]
    TicketPreOrder,
    #[serde(rename = "ticket-preorder-cancel")]
    TicketPreOrderCancel,
    #[serde(rename = "match-details-change")]
    MatchDetailsChange,
    #[serde(rename = "org-registration")]
    OrgRegistration,
    #[serde(rename = "auto-preorder-success")]
    AutoPreorderSuccess,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Recipient {
    pub email: String,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EmailMetadata {
    #[serde(default = "default_priority")]
    pub priority: String,
    pub tracking_id: Option<String>,
    pub send_at: Option<DateTime<Utc>>,
}

fn default_priority() -> String {
    "normal".to_string()
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SendEmailRequest {
    pub template_id: EmailTemplates,
    pub recipient: Recipient,
    pub subject: String,
    #[serde(default)]
    pub variables: HashMap<String, serde_json::Value>,
    pub metadata: Option<EmailMetadata>,
}



#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Match {
    pub id: String,
    pub organizer_id: String,
    pub match_description: String,
    pub team_home: String,
    pub team_away: String,
    pub stadium: String,
    pub match_status: u8,
    pub match_date_time: DateTime<Utc>,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
pub struct User {
    pub birthday: String,
    pub email: String,
    pub id: String,
    pub last_name: String,
    pub name: String,
    pub phone: String,
}


#[derive(Deserialize, Debug, Clone, Serialize)]
pub struct UserResp {
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<User>
}

#[derive(Serialize, Deserialize, Debug, Clone)]
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

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub enum TicketStatus {
    #[serde(rename = "available")]
    Available,
    #[serde(rename = "reserved")]
    Reserved,
    #[serde(rename = "sold")]
    Sold
}
