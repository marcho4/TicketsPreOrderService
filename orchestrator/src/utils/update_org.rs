use crate::models::message_resp::MessageResp;
use crate::models::update_org_data::UpdateOrgData;
use crate::orchestrator::orchestrator::Orchestrator;

impl Orchestrator {
    pub async fn update_organizer(&self, update_info: UpdateOrgData, id: String) -> Result<MessageResp, String> {
        let url = format!("{}/update_organizer_info/{}", self.config.organizer_url, id);
        let res = self.client.put(&url).json(&update_info).send().await;
        if res.is_err() {
            log::error!("{}", res.err().unwrap());
            Err("Failed to update organizer".to_string())
        } else {
            match res.unwrap().json::<MessageResp>().await {
                Ok(resp) => Ok(resp),
                Err(e) => Err(e.to_string()),
            }
        }
    }
}