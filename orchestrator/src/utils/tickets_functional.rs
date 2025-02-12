use crate::orchestrator::orchestrator::Orchestrator;

impl Orchestrator {
    pub async fn get_match_tickets(&self, match_id: String) {
        let url = format!("{}/ticket/{}/get", self.config.tickets_url, match_id);

    }
    pub async fn reserve_ticket(&self, ticket_id: String) {}
    pub async fn get_users_tickets(&self, user_id: String) {}
    pub async fn cancel_preorder(&self, ticket_id: String) {}

    pub async fn add_match_tickets(&self, ticket_ids: Vec<String>) {}


}