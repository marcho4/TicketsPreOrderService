use reqwest::Method;

use crate::{models::payments::{Payment, PaymentRequest, PaymentResponse, Refund, RefundResponse}, orchestrator::orchestrator::Orchestrator};
use crate::models::api_response::ApiResponse;
use crate::models::payments::PaymentStatusRequest;
use super::errors::OrchestratorError;

impl Orchestrator {
    pub async fn create_payment(&self, payment_request: PaymentRequest) -> Result<PaymentResponse, OrchestratorError> {
        let url = format!("{}/payments/create", self.config.payment_url);
        self.send_request::<PaymentResponse, PaymentRequest>(url, Some(payment_request), Method::POST).await
    }

    pub async fn get_user_payments(&self, user_id: String) -> Result<Vec<Payment>, OrchestratorError> {
        let url = format!("{}/user/{}/payments", self.config.payment_url, user_id);
        self.send_request::<Vec<Payment>, ()>(url, None, Method::GET).await
    }

    pub async fn get_user_refunds(&self, user_id: String) -> Result<Vec<Refund>, OrchestratorError> {
        let url = format!("{}/user/{}/refunds", self.config.payment_url, user_id);
        self.send_request::<Vec<Refund>, ()>(url, None, Method::GET).await
    }

    pub async fn refund_payment(&self, payment_id: String) -> Result<ApiResponse<RefundResponse>, OrchestratorError> {
        let url = format!("{}/payments/{}/refund", self.config.payment_url, payment_id);
        self.send_request::<ApiResponse<RefundResponse>, ()>(url, None, Method::POST).await
    }


    pub async fn get_payment_status(&self, payment_id: String, is_refund: bool) -> Result<PaymentResponse, OrchestratorError> {
        let data = PaymentStatusRequest {
            operation_type: match is_refund {
                true => {"REFUND".to_string()},
                false => {"PAYMENT".to_string()}
            } ,
        };
        let url = format!("{}/payments/{}/status", self.config.payment_url, payment_id);
        self.send_request::<PaymentResponse, PaymentStatusRequest>(url, Some(data), Method::POST).await
    }
}