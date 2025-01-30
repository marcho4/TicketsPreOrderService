use actix_web::error::ErrorInternalServerError;
use crate::models::organizer_info::OrganizerInfo;
use crate::orchestrator::orchestrator::Orchestrator;

impl Orchestrator {
    pub async fn get_org_info(&self, id: String) -> Result<OrganizerInfo, actix_web::Error> {
        let url = format!("{}/get_account_info/{}", self.config.organizer_url, id);

        let resp = match self.client.get(&url).send().await {
            Ok(resp) => resp,
            Err(err) => return Err(ErrorInternalServerError(err.to_string())),
        };

        let parsed = match resp.json::<OrganizerInfo>().await {
            Ok(parsed) => parsed,
            Err(err) => return Err(ErrorInternalServerError(err.to_string())),
        };

        Ok(parsed)
    }
}