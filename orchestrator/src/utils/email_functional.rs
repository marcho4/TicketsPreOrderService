use std::collections::HashMap;
use crate::models::email::{EmailMetadata, EmailTemplates, Recipient, SendEmailRequest};
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::errors::OrchestratorError;

impl Orchestrator {
    pub async fn send_email(
        &self,
        template_id: EmailTemplates,
        recipient: Recipient,
        variables: HashMap<String, serde_json::Value>,
        metadata: Option<EmailMetadata>
    ) -> Result<String, OrchestratorError> {

        let subject = match template_id {
            EmailTemplates::RegistrationSuccess => "Успешная регистрация в сервисе",
            EmailTemplates::MatchDetailsChange => "Изменения в матче",
            EmailTemplates::OrganizerApproval => "Ваша заявка на регистрацию успешно обработана",
            EmailTemplates::TicketPreOrder => "Успешный предзаказ билета",
            EmailTemplates::TicketPreOrderCancel => "Успешная отмена предзаказа билета",
            EmailTemplates::OrgRegistration => "Успешная заявка на регистрацию"
        }.to_string();

        let send_data = SendEmailRequest {
            template_id,
            recipient,
            subject,
            variables,
            metadata,
        };

        match self.safe_send_email_task(&send_data).await {
            Ok(_) => Ok(String::from("Successfully sent email")),
            Err(e) => Err(OrchestratorError::Service(e.to_string()))
        }
    }
}