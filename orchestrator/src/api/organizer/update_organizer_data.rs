use crate::models::api_response::ApiResponse;
use crate::models::message_resp::MessageResp;
use crate::models::update_org_data::UpdateOrgData;
use crate::orchestrator::orchestrator::Orchestrator;
use actix_web::{put, web, HttpRequest, HttpResponse};
use crate::models::roles::Role;
use crate::utils::request_validator::RequestValidator;

#[utoipa::path(
    put,
    path = "/api/organizer/update/{id}",
    tag = "Organizer",
    description = "Update organizer info",
    summary = "Обновить данные организатора",
    params(
        ("id" = String, Path, description = "Unique organizer ID")
    ),
    request_body = UpdateOrgData,
    responses(
        (status = 200, description = "Successfully updated", body = ApiResponse<MessageResp>),
        (status = 500, description = "Error", body = ApiResponse<String>)
    )
)]
#[put("/update/{id}")]
pub async fn update(
    id: web::Path<String>,
    data: web::Json<UpdateOrgData>,
    orchestrator: web::Data<Orchestrator>,
    req: HttpRequest,
) -> HttpResponse {
    let org_data = data.into_inner();

    let org_id = id.into_inner();

    let validation = RequestValidator::validate_req(&req, Role::ORGANIZER,
                                                    Some(org_id.as_str()));

    if let Err(e) = validation {
        return e;
    }

    match orchestrator.update_organizer(org_data, org_id).await {
        Ok(resp) => HttpResponse::Ok().json(ApiResponse::<MessageResp> {
            msg: Some("Success".to_string()),
            data: Some(resp),
        }),
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<String> {
            msg: Some(e.to_string()),
            data: None,
        }),
    }
}
