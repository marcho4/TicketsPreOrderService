use crate::models::api_response::ApiResponse;
use crate::models::message_resp::MessageResp;
use crate::models::update_org_data::UpdateOrgData;
use crate::orchestrator::orchestrator::Orchestrator;
use actix_web::{post, web, HttpResponse};

#[post("/update/{id}")]
pub async fn update(
    id: web::Path<String>,
    data: web::Json<UpdateOrgData>,
    orchestrator: web::Data<Orchestrator>,
) -> HttpResponse {
    let org_data = data.into_inner();
    let update_result = orchestrator
        .update_organizer(org_data, id.into_inner())
        .await;
    match update_result {
        Ok(resp) => HttpResponse::Ok().json(ApiResponse::<MessageResp> {
            msg: Some("success".to_string()),
            data: Some(resp),
        }),
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<String> {
            msg: Some(e.to_string()),
            data: None,
        }),
    }
}
