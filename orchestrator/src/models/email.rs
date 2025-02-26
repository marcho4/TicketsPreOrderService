use std::collections::HashMap;
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize };

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

#[derive(Debug, Serialize, Deserialize)]
pub struct SendEmailResponse {
    pub success: bool,
    pub message: String,
    pub email_id: String,
    pub sent_at: DateTime<Utc>,
}
