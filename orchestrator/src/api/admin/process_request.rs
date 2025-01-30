use actix_web::{post, web, Error, HttpResponse};
use actix_web::error::{ErrorBadRequest, ErrorInternalServerError};
use log::info;
use serde_json::json;
use crate::models::api_response::ApiResponse;
use crate::models::create_org_data::CreateOrgData;
use crate::models::org_approve_body::OrgApproveBody;
use crate::models::org_approve_response::OrgApproveResponse;
use crate::models::org_creation_response::OrgCreationResponse;
use crate::models::organizer_registration_data::OrganizerRegistrationData;
use crate::models::request_process_info::{RequestProcessInfo, Status};
use crate::orchestrator::orchestrator::Orchestrator;

#[post("/process")]
pub async fn process_request(data: web::Json<RequestProcessInfo>, orch: web::Data<Orchestrator>) -> HttpResponse {
    let json_body = data.into_inner();

    // Getting requests from admin service
    let requests = match orch.get_admin_requests().await {
        Ok(requests) => {requests},
        Err(e) => {return HttpResponse::InternalServerError().json(ApiResponse::<String> {
            msg: Some("Error while getting admin requests".to_string()),
            data: Some(e.to_string()),
        })}
    };

    // Filtering out request with id, passed into request
    let request_info = requests.iter()
        .find(|request| request.request_id == json_body.request_id);

    if request_info.is_none() {
        return HttpResponse::NotFound().json(ApiResponse::<String> {
            msg: Some("Admin request with such ID was not found".to_string()),
            data: None,
        });
    }

    info!("Request data: {:?}", request_info.unwrap());

    let url = "http://admin:8003/admin/process_organizer".to_string();
    let response = orch.client.post(url).json(&json_body).send().await;

    let _ = match response {
        Ok(res) => {
            if !res.status().is_success() {
                return HttpResponse::InternalServerError().json(ApiResponse::<String> {
                    msg: Some("Internal server error in admin service".to_string()),
                    data: None
                })
            };
        },
        Err(_e) => {return HttpResponse::InternalServerError().json(ApiResponse::<String> {
            msg: Some("Internal server error".to_string()),
            data: None
            })
        }
    };


    if json_body.status == Status::APPROVED {
        let request_info = request_info.unwrap();

        let org_data = CreateOrgData {
            email: request_info.email.clone(),
            tin: request_info.tin.clone(),
            organization_name: request_info.company.clone(),
        };

        info!("Creating organizer: {:?}", org_data);
        let create_org_url = "http://organizer:8004/create_organizer_info";

        let creation_resp = orch.client.post(create_org_url).json(&org_data).send().await
            .map_err(|e| HttpResponse::InternalServerError().json(ApiResponse::<String> {
                msg: Some("Internal server error in organizer creation".to_string()),
                data: None
            })
        ).unwrap();

        let data = match creation_resp.json::<OrgCreationResponse>().await {
            Ok(res) => {res}
            Err(_e) => { return HttpResponse::InternalServerError().json(ApiResponse::<String> {
                msg: Some("Error while creating organizer".to_string()), data: None })}
        };
        let org_id = data.data.id;

        // Approve registration
        let approve_url = "http://auth:8002/organizer/approve";
        let json_body = OrgApproveBody {
            email: request_info.email.clone(),
            company: request_info.company.clone(),
            tin: request_info.tin.clone(),
            status: "APPROVED".to_string(),
            user_id: org_id,
        };

        let approve_response = orch.client.post(approve_url).json(&json_body).send()
            .await.map_err(|e| HttpResponse::InternalServerError().json(
            ApiResponse::<String> {
                msg: Some("Internal server error in organizer approval".to_string()),
                data: None
            }
        )).unwrap();

        match approve_response.json::<OrgApproveResponse>().await {
            Ok(resp) => {
                HttpResponse::Ok().json(ApiResponse::<OrgApproveResponse> {
                msg: Some("Success".to_string()),
                data: Some(resp)
            })},
            Err(_e) => { HttpResponse::InternalServerError().json(ApiResponse::<String> {
                msg: Some("Internal server error in decoding approval message".to_string()),
                data: None
            })}
        }

    } else {
        HttpResponse::Ok().json(ApiResponse::<String> {
            msg: Some("Successfully Rejected the request".to_string()),
            data: None
        })
    }
}