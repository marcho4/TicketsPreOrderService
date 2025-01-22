use actix_web::{post, web, HttpRequest, HttpResponse};
use log::info;
use crate::models::api_response::ApiResponse;
use crate::models::organizer_registration_data::OrganizerRegistrationData;
use crate::models::registration_err_org::RegistrationErrorOrg;
use crate::models::registration_org_resp::RegistrationOrgResp;
use crate::orchestrator::orchestrator::Orchestrator;

#[post("/register/organizer")]
pub async fn register_organizer(
    orchestrator: web::Data<Orchestrator>,
    data: web::Json<OrganizerRegistrationData>,
    _req: HttpRequest
) -> HttpResponse {
    let url = format!("{}/register_organizer", orchestrator.config.auth_base_url);
    let data = data.into_inner();
    let response = orchestrator.client.post(&url).json(&data).send().await;
    let org_data: RegistrationOrgResp = match response {
        Ok(resp) => {
            if resp.status().is_success() {
                match resp.json::<RegistrationOrgResp>().await {
                    Ok(data) => data,
                    Err(e) => return HttpResponse::InternalServerError().json(ApiResponse::<String> {
                        msg: Some("Error happened during processing response body from auth service".to_string()),
                        data: Some(e.to_string()),
                    }),
                }
            } else {
                let err_msg = match resp.json::<RegistrationErrorOrg>().await {
                    Ok(data) => data,
                    Err(e) => return HttpResponse::InternalServerError().json(ApiResponse::<String> {
                        msg: Some("Error happened during processing response body from auth service".to_string()),
                        data: Some(e.to_string()),
                    }),
                };
                return HttpResponse::BadRequest().json(ApiResponse::<RegistrationErrorOrg> {
                    msg: Some("Something wrong during registration".to_string()),
                    data: Some(err_msg)
                })
            }
        },
        Err(e) => return HttpResponse::InternalServerError().json(ApiResponse::<String> {
            msg: Some("Error happened during request to auth service".to_string()),
            data: Some(e.to_string()),
        })
    };

    // Send request to admin service
    let admin_req_url = "http://admin:8003/add_organizer_request".to_string();
    let admin_resp = orchestrator.client.post(&admin_req_url)
        .json(&data).send().await;
    info!("admin response: {:?}", admin_resp);

    if !admin_resp.unwrap().status().is_success() {
        return HttpResponse::InternalServerError().json(ApiResponse::<String> {
            msg: Some("Error happened during admin request".to_string()),
            data: None
        })
    }

    HttpResponse::Ok().json(ApiResponse::<RegistrationOrgResp> {
        msg: Some("Successfully registered".to_string()),
        data: Some(org_data)
    })
}