use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq, ToSchema)]
pub struct PaymentRequest {
    pub user_id: String,
    pub amount: String,
    pub currency: String,
    pub provider: String, // Закидываем рандомного
    pub match_id: String,
    pub ticket_id: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq, ToSchema)]
pub struct PaymentResponse {
    pub message: String,
    pub payment_id: String,
    pub payment_url: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq, ToSchema)]
pub struct RefundResponse {
    pub match_id: String,
    pub ticket_id: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq, ToSchema)]
pub struct Refund {
    pub refund_id: String,
    pub payment_id: String,
    pub user_id: String,
    pub status: String,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq, ToSchema)]
pub struct Payment {
    pub payment_id: String,
    pub user_id: String,
    pub amount: String,
    pub currency: String,
    pub status: String,
    pub match_id: String,
    pub ticket_id: String,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq, ToSchema)]
pub struct PaymentStatus {
    pub payment_id: String,
    pub status: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq, ToSchema)]
pub struct PaymentStatusRequest {
    pub operation_type: String,
}