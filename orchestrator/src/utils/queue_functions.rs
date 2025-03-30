use reqwest::Method;
use crate::models::queue_models::QueueModel;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::errors::OrchestratorError;

impl Orchestrator {
    pub async fn add_to_queue(&self, match_id: String, data: QueueModel) -> Result<(), OrchestratorError> {
        let url = format!("{}/user/{}", self.config.queue_url, match_id);
        let resp = self.client.post(&url).json(&data).send().await;
        match resp {
            Ok(resp) => {
                if resp.status().is_success() {
                    Ok(())
                } else {
                    Err(OrchestratorError::Other("Статус запроса на добавление не успешный".to_string()))
                }
            },
            Err(e) => Err(OrchestratorError::Request(e)),
        }
    }
    pub async fn delete_from_queue(&self, match_id: String, user_id: String) -> Result<(), OrchestratorError> {
        let url = format!("{}/user/{}/{}", self.config.queue_url, match_id, user_id);
        let resp = self.client.delete(&url).send().await;
        match resp {
            Ok(resp) => {
                if resp.status().is_success() {
                    Ok(())
                } else {
                    Err(OrchestratorError::Other("Статус запроса на удаление не успешный".to_string()))
                }
            },
            Err(e) => Err(OrchestratorError::Request(e)),
        }
    }
}