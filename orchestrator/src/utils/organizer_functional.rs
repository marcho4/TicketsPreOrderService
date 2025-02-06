use crate::models::create_org_data::CreateOrgData;
use crate::models::message_resp::MessageResp;
use crate::models::org_creation_response::OrgCreationResponse;
use crate::models::organizer_info::OrganizerInfo;
use crate::models::update_org_data::UpdateOrgData;
use crate::orchestrator::orchestrator::Orchestrator;
use log::info;
use crate::utils::errors::OrchestratorError;
use crate::utils::errors::OrchestratorError::*;


impl Orchestrator {
    pub async fn get_org_info(&self, id: String) -> Result<OrganizerInfo, OrchestratorError> {
        let url = format!("{}/get_account_info/{}", self.config.organizer_url, id);
        let resp = self.client.get(&url).send()
            .await
            .map_err(|e| Request(e.into()))?;

        if resp.status().as_u16() == 404 {
            Err(Other("Account not found".to_string()))
        } else if resp.status().as_u16() == 400 {
            Err(Other("Invalid request".to_string()))
        } else {
            Ok(resp.json::<OrganizerInfo>().await
                .map_err(|e| Request(e.into()))?)
        }
    }
    pub async fn update_organizer(&self, update_info: UpdateOrgData, id: String) -> Result<MessageResp, OrchestratorError> {
        let url = format!("{}/update_organizer_info/{}", self.config.organizer_url, id);
        info!("Updating organizer info for {}", id);
        let resp = self.client.put(&url).json(&update_info).send()
            .await.map_err(|e| Request(e.into()))?;
        resp.json::<MessageResp>().await.map_err(|e| Request(e.into()))
    }
    pub async fn create_organizer(&self, create_org_data: CreateOrgData) -> Result<OrgCreationResponse, OrchestratorError> {
        let url = format!("{}/create_organizer_info", self.config.organizer_url);
        info!("Creating organizer: {:?}", create_org_data);
        let resp = self.client.post(&url).json(&create_org_data).send().await
            .map_err(|e| Request(e.into()))?;
        resp.json::<OrgCreationResponse>().await
            .map_err(|e| Request(e.into()))
    }
}