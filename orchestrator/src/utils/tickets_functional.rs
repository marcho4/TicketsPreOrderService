use reqwest::Method;
use crate::models::message_resp::MessageResp;
use crate::models::tickets::{CancelData, Ticket, TicketReservation, TicketsAddResponse};
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::errors::OrchestratorError;
use reqwest::multipart;
use tokio::fs::File;
use tokio_util::codec::{BytesCodec, FramedRead};
use crate::models::delete_tickets::{DeleteTickets, DeleteTicketsResp};
use crate::utils::errors::OrchestratorError::{Deserialize, Service};

impl Orchestrator {
    pub async fn get_match_tickets(&self, match_id: String) -> Result<Vec<Ticket>, OrchestratorError> {
        let url = format!("{}/ticket/{}/get", self.config.tickets_url, match_id);
        Ok(self.send_request::<Vec<Ticket>, Vec<Ticket>>(url, None, Method::GET).await?)
    }

    pub async fn reserve_ticket(&self, ticket_id: &String, data: TicketReservation) -> Result<MessageResp, OrchestratorError> {
        let url = format!("{}/ticket/{}/reserve", self.config.tickets_url, ticket_id);
        Ok(self.send_request::<MessageResp, TicketReservation>(url, Some(data), Method::PUT).await?)
    }
    pub async fn get_users_tickets(&self, user_id: String) -> Result<Vec<Ticket>, OrchestratorError> {
        let url = format!("{}/user/{}/tickets", self.config.tickets_url, user_id);
        Ok(self.send_request::<Vec<Ticket>, Vec<Ticket>>(url, None, Method::GET).await?)
    }
    pub async fn cancel_preorder(&self, ticket_id: String, data: CancelData) -> Result<MessageResp, OrchestratorError> {
        let url = format!("{}/ticket/{}/cancel", self.config.tickets_url, ticket_id);
        Ok(self.send_request::<MessageResp, CancelData>(url, Some(data), Method::PUT).await?)
    }

    pub async fn get_ticket(&self, ticket_id: String) -> Result<Ticket, OrchestratorError> {
        let url = format!("{}/ticket/{}", self.config.tickets_url, ticket_id);
        Ok(self.send_request::<Ticket, String>(url, None, Method::GET).await?)
    }

    pub async fn delete_tickets(&self, match_id: String, tickets: DeleteTickets) -> Result<DeleteTicketsResp, OrchestratorError> {
        let url = format!("{}/ticket/{}/delete", self.config.tickets_url, match_id);
        Ok(self.send_request::<DeleteTicketsResp, DeleteTickets>(url, Some(tickets), Method::DELETE).await?)
    }

    pub async fn add_match_tickets(&self, match_id: &String, file_path: &String) -> Result<TicketsAddResponse, OrchestratorError> {
        let url = format!("{}/ticket/{}/add", self.config.tickets_url, match_id);
        let file = File::open(file_path).await.map_err(|_e|
            OrchestratorError::Other("Error with file opening".to_string()))?;

        // Готовим поток для чтения файла
        let file_stream = FramedRead::new(file, BytesCodec::new());

        // Создаём часть для multipart-формы
        let file_part = multipart::Part::stream(reqwest::Body::wrap_stream(file_stream))
            // Можно указать имя файла, которое будет видно на сервере
            .file_name("temp_tickets");

        let form = multipart::Form::new()
            .part("tickets_crud", file_part);

        let resp = self.client.post(url).multipart(form).send().await.map_err(|e|
            OrchestratorError::Request(e.into()))?;

        if resp.status().is_success() {
            let text = resp.text().await
                .map_err(|_e| OrchestratorError::Other("Error getting text from request".to_string()))?;
            let resp = serde_json::from_str::<TicketsAddResponse>(&text)
                .map_err(|e| Deserialize(e.into()))?;

            // If everything is good - deleting file from the system
            tokio::fs::remove_file(file_path).await.map_err(
                |_e| OrchestratorError::Other("Error deleting file".to_string())
            )?;

            Ok(resp)
        } else {
            let text = resp.text().await
                .map_err(|_e| OrchestratorError::Other("Error getting text from request".to_string()))?;
            let resp = serde_json::from_str::<MessageResp>(&text)
                .map_err(|e| Deserialize(e.into()))?;
            Err(Service(resp.message))
        }



    }

    pub async fn pay_for_ticket(&self, ticket_id: String, data: TicketReservation) -> Result<MessageResp,OrchestratorError> {
        let url = format!("{}/ticket/{}/pay", self.config.tickets_url, ticket_id);
        self.send_request::<MessageResp, TicketReservation>(url, Some(data), Method::PUT).await
    }

    pub async fn refund_ticket(&self, ticket_id: String, data: TicketReservation) -> Result<MessageResp, OrchestratorError> {
        let url = format!("{}/ticket/{}/refund", self.config.tickets_url, ticket_id);
        self.send_request::<MessageResp, TicketReservation>(url, Some(data), Method::PUT).await
    }
}