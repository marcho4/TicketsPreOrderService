use crate::models::admin::AdminRequest;
use crate::models::organizer::OrganizerRegistrationData;
use crate::models::admin::RequestProcessInfo;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::errors::OrchestratorError;
use log::{error, info};


impl Orchestrator {
    pub async fn process_organizer(&self, json_body: &RequestProcessInfo) -> Result<(), OrchestratorError> {
        let url = format!("{}/admin/process_organizer", self.config.admin_url);
        let resp = self.client.post(url).json(&json_body).send().await
            .map_err(|e| OrchestratorError::Request(e.into()))?;
        if resp.status().is_success() {
            Ok(())
        } else {
            Err(OrchestratorError::Service("Error in admin service".to_string()))
        }
    }
    pub async fn add_organizer_request(&self, json_body: &OrganizerRegistrationData) -> Result<(), OrchestratorError> {
        let url = format!("{}/admin/add_organizer_request", self.config.admin_url);
        let res = self.client.post(&url).json(&json_body).send().await
            .map_err(|e| OrchestratorError::Request(e.into()))?;

        if res.status().is_success() {
            Ok(())
        } else {
            if res.status() == 400 {
                return Err(OrchestratorError::Service("Email already exists".to_string()))
            };
            error!("{}", res.text().await?);
            Err(OrchestratorError::Service("Error in adding organizer request.".to_string()))
        }
    }
    pub async fn get_admin_requests(&self) -> Result<Vec<AdminRequest>, OrchestratorError> {
        let url = format!("{}/admin/pending_requests", self.config.admin_url);
        let response = self.client.get(url).send().await
            .map_err(|e| OrchestratorError::Request(e.into()))?;

        let text = response.text().await
            .map_err(|e| OrchestratorError::Request(e.into()))?;

        let res_serialized= serde_json::from_str::<Vec<AdminRequest>>(text.as_str())
            .map_err(|e| OrchestratorError::Deserialize(e.into()))?;

        info!("Successfully parsed admin requests");
        Ok(res_serialized)
    }
}