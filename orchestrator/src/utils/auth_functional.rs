use crate::models::org_approve_body::OrgApproveBody;
use crate::models::org_approve_response::OrgApproveResponse;
use crate::models::organizer_registration_data::OrganizerRegistrationData;
use crate::models::registration_err_org::RegistrationErrorOrg;
use crate::models::registration_org_resp::RegistrationOrgResp;
use crate::orchestrator::orchestrator::Orchestrator;
use log::{error, info};
use reqwest::Method;
use crate::models::api_response::ApiResponse;
use crate::models::login_data::LoginData;
use crate::models::message_resp::MessageResp;
use crate::models::password_update::PasswordUpdate;
use crate::models::user_info::UserInfo;
use crate::models::user_registration_data::UserRegistrationData;
use crate::utils::errors::OrchestratorError;
use crate::utils::errors::OrchestratorError::{Deserialize, Request, Service};

impl Orchestrator {
    pub async fn org_approve(&self, json_body: &OrgApproveBody) -> Result<OrgApproveResponse, OrchestratorError>{
        let approve_url = format!("{}/organizer/approve", self.config.auth_url);
        let res = self.client.post(approve_url).json(&json_body).send().await
            .map_err(|e| {
                error!("Organizer approval error {}", e.to_string());
                Request(e.into())
            })?;

        Ok(res.json::<OrgApproveResponse>().await.map_err(|e| {
            error!("Organizer approval error {}", e.to_string());
            Request(e.into())
        })?)
    }
    pub async fn user_register(&self, data: &UserRegistrationData) -> Result<MessageResp, OrchestratorError> {
        let url = format!("{}/user/register", self.config.auth_url);

        match self.client.post(url).json(&data).send().await {
            Ok(resp) => {
                if resp.status().is_success() {
                    match resp.json::<MessageResp>().await {
                        Ok(body) => {
                            info!("Successfully created user {:?}", &body);
                            Ok(body)
                        },
                        Err(e) => {
                            error!("User registration error: {}", e.to_string());
                            Err(Request(e.into()))
                        },
                    }
                } else {
                    Err(Service("Bad credentials. Data may be incorrect or email already exists".to_string()))
                }
            },
            Err(e) => {
                error!("User registration error: {}", e.to_string());
                Err(Request(e.into()))
            }
        }
    }
    pub async fn org_register(&self, json_body: &OrganizerRegistrationData) -> Result<RegistrationOrgResp, OrchestratorError> {
        let url = format!("{}/organizer/register", self.config.auth_url);
        let response = self.client.post(&url).json(&json_body).send().await;

        if response.is_err() {
            let err = response.err().unwrap();
            error!("{:?}", err);
            return Err(Request(err.into()));
        };

        let resp_text = response.ok().unwrap().text()
            .await.map_err(|e| Service(e.to_string()))?;

        let success_res = serde_json::from_str::<RegistrationOrgResp>(&resp_text);
        let err_res = serde_json::from_str::<RegistrationErrorOrg>(&resp_text);

        if success_res.is_ok() {
            Ok(success_res?)
        } else if err_res.is_ok() {
            Err(Service(err_res?.message))
        } else {
            Err(Deserialize(success_res.unwrap_err().into()))
        }
    }
    pub async fn authorize(&self, data: &LoginData) -> Result<UserInfo, OrchestratorError> {
        let req_url = format!("{}/authorize", self.config.auth_url);

        let auth_response = self.client.post(&req_url).json(&data).send().await
            .map_err(|e| {
                error!("Error sending request: {}", e);
                Request(e.into())
            })?;

        if auth_response.status() == reqwest::StatusCode::UNAUTHORIZED {
            return Err(OrchestratorError::Unauthorized)
        };

        info!("Login for {:?} successful", data);

        let data = auth_response.json::<ApiResponse<UserInfo>>().await
            .map_err(|e| { Request(e.into()) })?.data;
        if data.is_none() {
             Err(Service("Error while getting data".to_string()))
        } else {
            Ok(data.unwrap())
        }

    }

    // pub async fn create_admin() {}

    pub async fn change_password(&self, data: &PasswordUpdate, user_id: String) -> Result<MessageResp, OrchestratorError> {
        let req_url = format!("{}/user/{}/password/change", self.config.auth_url, user_id);
        self.send_request::<MessageResp, &PasswordUpdate>(req_url, Some(data), Method::PUT).await
    }
}