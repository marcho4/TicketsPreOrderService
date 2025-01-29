use actix_web::error::ErrorInternalServerError;
use crate::models::admin_request::AdminRequest;
use crate::orchestrator::orchestrator::Orchestrator;

impl Orchestrator {
    pub async fn get_admin_requests(&self) -> Result<Vec<AdminRequest>, actix_web::Error> {
        let url = format!("{}/pending_requests", self.config.admin_url);
        let response = self.client.get(url).send().await;

        match response {
            Ok(res) => {
                let text = res.text().await.unwrap();
                let res_serialized= serde_json::from_str::<Vec<AdminRequest>>(text.as_str());
                let serialized = match res_serialized {
                    Ok(serialized) => {serialized},
                    Err(_e) => return Err(ErrorInternalServerError("Error retrieving response body")),
                };
                Ok(serialized)
            },
            Err(_e) => Err(ErrorInternalServerError("An error occured while fetching the admin request")),
        }
    }
}
