use actix_web::{post, web, HttpResponse};
use actix_web::error::{ErrorBadRequest, ErrorInternalServerError};
use log::info;
use crate::models::api_response::ApiResponse;
use crate::models::organizer_registration_data::OrganizerRegistrationData;
use crate::models::request_process_info::{RequestProcessInfo, Status};
use crate::orchestrator::orchestrator::Orchestrator;

#[post("/process")]
pub async fn process_request(data: web::Json<RequestProcessInfo>, orch: web::Data<Orchestrator>) -> HttpResponse {
    let json_body = data.into_inner();

    let requests = orch.get_admin_requests().await.map_err(|e|
        return ErrorInternalServerError(e)).unwrap();

    let request_info = requests.iter().find(|request| request.request_id == json_body.request_id)
        .ok_or(return HttpResponse::InternalServerError().json(ApiResponse::<String> {
            msg: "Request not found".into(),
            data: None,
        })).unwrap();

    info!("Request data: {:?}", request_info);

    let url = "http://admin:8003/process_organizer".to_string();
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
        // Создать объект информации организатора (email tin company)
        // /authorize_approved - (email, tin, company, status)
        // в теле ответа возвращаю пароль и логин

        let org_data = OrganizerRegistrationData {
            company: request_info.company.clone(),
            email: request_info.email.clone(),
            tin: request_info.tin.clone(),
        };

        let create_org_url = "http://organizer:8004/create_organizer_info";

        let creation_resp = orch.client.post(create_org_url).json(&org_data).send().await
            .map_err(|e| return HttpResponse::InternalServerError().json(ApiResponse::<String> {
                msg: Some("Internal server error in organizer creation".to_string()),
                data: None
            })
        )?;

        match creation_resp.json::<>().await {
            Ok(res) => {}
            Err(_e) => { HttpResponse::InternalServerError().json(ApiResponse::<String> {
                msg: Some("Error while creating organizer".to_string()), data: None })}
        }

        // сгенерировать пароль
    } else {
        HttpResponse::Ok().json(ApiResponse::<String> {
            msg: Some("Successfully Rejected the request".to_string()),
            data: None
        })
    }
}