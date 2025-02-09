use log::{error, info};
use reqwest::{Method};
use serde::de::DeserializeOwned;
use serde::{Serialize};
use crate::models::matches::{CreateMatchData, Match, UpdateMatchData};
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::errors::OrchestratorError;
use crate::utils::errors::OrchestratorError::{Deserialize, Request, Service};

impl Orchestrator {
    pub async fn create_match(&self, data: CreateMatchData, org_id: String) -> Result<Match, OrchestratorError> {
        let url = format!("{}/api/match/create_match/{}", self.config.matches_url, org_id);
        self.send_request::<Match, CreateMatchData>(url, Some(data), Method::POST).await
    }
    pub async fn update_match(&self, id: String, data: UpdateMatchData) -> Result<Match, OrchestratorError> {
        let url = format!("{}/api/match/update_match/{}", self.config.matches_url, id);
        self.send_request::<Match, UpdateMatchData>(url, Some(data), Method::PUT).await
    }
    pub async fn delete_match(&self, id: String, org_id: String) -> Result<(), OrchestratorError> {
        let url = format!("{}/api/match/delete_match/{}/{}", self.config.matches_url, id, org_id);
        self.send_request::<(), UpdateMatchData>(url, None, Method::DELETE).await
    }
    pub async fn get_match(&self, id: String) -> Result<Match, OrchestratorError> {
        let url = format!("{}/api/match/get_match/{}", self.config.matches_url, id);
        self.send_request::<Match, UpdateMatchData>(url, None, Method::GET).await
    }
    pub async fn get_all_matches(&self) -> Result<Vec<Match>, OrchestratorError> {
        let url = format!("{}/api/match/get_all_matches", self.config.matches_url);
        self.send_request::<Vec<Match>, String>(url, None, Method::GET).await
    }
    pub async fn get_matches_by_org(&self, org_id: String) -> Result<Vec<Match>, OrchestratorError> {
        let url = format!("{}/api/match/get_organizer_matches/{}", self.config.matches_url, org_id);
        self.send_request::<Vec<Match>, String>(url, None, Method::GET).await
    }
    async fn check_response(status: u16, text: &String) -> Option<OrchestratorError> {
        if status >= 299 {
            error!("Error with status code {} : {}", status, text);
            Some(Service(format!("Bad response from service. Details: {}", text)))
        } else {
            None
        }
    }
    pub async fn send_request<T, U>(&self, url: String, data: Option<U>, method: Method) -> Result<T, OrchestratorError>
    where T: DeserializeOwned + , U: Serialize {
        let mut req = self.client.request(method.clone(), &url);
        if let Some(data) = data {
            req = req.json(&data);
        }

        let response = req.send().await.map_err(|e| {
            error!("Error while sending request to {}: {:?}", url, e);
            Request(e)
        })?;
        let status_code = response.status().as_u16();
        let text = response.text().await.unwrap_or_default();
        let err = Self::check_response(status_code, &text).await;
        if let Some(err) = err {
            return Err(err);
        }

        let result = serde_json::from_str::<T>(&text).map_err(|e| {
            error!("Error while deserializing: {:?}", e);
            error!("Error response body: {:?}", text);
            Deserialize(e)
        })?;

        info!("Success {} {}", method ,url);

        Ok(result)
    }
}