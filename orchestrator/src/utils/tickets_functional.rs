use reqwest::Method;
use crate::models::tickets::Ticket;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::errors::OrchestratorError;

impl Orchestrator {
    pub async fn get_match_tickets(&self, match_id: String) -> Result<Vec<Ticket>, OrchestratorError> {
        let url = format!("{}/ticket/{}/get", self.config.tickets_url, match_id);
        Ok(self.send_request::<Vec<Ticket>, Vec<Ticket>>(url, None, Method::GET).await?)
    }

    pub async fn reserve_ticket(&self, ticket_id: String) -> Result<(), OrchestratorError> {
        let url = format!("{}/ticket/{}/reserve", self.config.tickets_url, ticket_id);
        unimplemented!()
    }
    pub async fn get_users_tickets(&self, user_id: String) -> Result<Vec<Ticket>, OrchestratorError> {
        unimplemented!()

    }
    pub async fn cancel_preorder(&self, ticket_id: String) -> Result<(), OrchestratorError> {
        let url = format!("{}/ticket/{}/cancel", self.config.tickets_url, ticket_id);
        unimplemented!()

    }

    // TODO - переделать логику
    // pub async fn delete_tickets(&self, match_id: String) -> Result<(), OrchestratorError> {
    //     let url = format!("{}/ticket/{}/delete", self.config.tickets_url, match_id);
    // }

    pub async fn add_match_tickets(&self, ticket_ids: Vec<String>) -> Result<(), OrchestratorError> {
        unimplemented!()

    }
}