use log::info;
use crate::models::general::MessageResp;
use crate::models::organizer::OrgCreationResponse;
use crate::models::user::{User, UserCreateData, UserResp, UserUpdateData};
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::errors::OrchestratorError;
use crate::utils::errors::OrchestratorError::{Request, Service};

impl Orchestrator {
    pub async fn get_user(&self, id: String) -> Result<User, OrchestratorError> {
        let url = format!("{}/user/{}/get_account_info", self.config.user_url, id);

        let resp = self.client.get(url).send().await.map_err(|e| Request(e.into()))?;
        let serialized = resp.json::<UserResp>().await.map_err(|e| Request(e.into()))?;
        if serialized.data.is_none() {
            return Err(Service(serialized.message));
        };

        Ok(serialized.data.unwrap())
    }
    pub async fn update_user(&self, data: UserUpdateData, id: String) -> Result<MessageResp, OrchestratorError> {
        let url = format!("{}/user/{}/update_account", self.config.user_url, id);
        let resp = self.client.put(url).json(&data).send().await.map_err(|e| Request(e.into()))?;
        let status = resp.status();

        let serialized = resp.json::<MessageResp>().await.map_err(|e| Request(e.into()))?;

        if status.clone() == 400 || status.clone() == 404 {
            return Err(Service(serialized.message));
        };

        Ok(serialized)
    }
    pub async fn create_user(&self, data: UserCreateData) -> Result<OrgCreationResponse, OrchestratorError> {
        let url = format!("{}/user/create_account", self.config.user_url);
        let resp = self.client.post(url).json(&data).send().await.map_err(|e| Request(e.into()))?;
        info!("Response status: {}", resp.status());
        if resp.status() == 409 {
            return Err(Service("User already exists".to_string()));
        }
        let serialized = resp.json::<OrgCreationResponse>().await.map_err(|e| Request(e.into()))?;
        Ok(serialized)
    }
}