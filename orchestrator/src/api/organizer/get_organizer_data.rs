use crate::models::organizer::OrganizerInfo;
use crate::orchestrator::orchestrator::Orchestrator;
use actix_web::{get, web, HttpRequest, HttpResponse};
use actix_web::http::StatusCode;
use log::error;
use crate::models::general::ApiResponse;
use crate::models::general::Role;
use crate::utils::request_validator::RequestValidator;
use crate::utils::responses::generic_response;



#[utoipa::path(
    get,
    path = "/api/organizer/get/{id}",
    tag = "Organizer",
    description = "Get match info",
    summary = "Получить данные организатора",
    params(
        ("id" = String, Path, description = "Unique organizer ID"),
    ),
    responses(
        (status = 200, description = "Successfully found", body = ApiResponse<OrganizerInfo>),
        (status = 500, description = "Error", body = ApiResponse<String>)
    )
)]
#[get("/get/{id}")]
pub async fn get_organizer(
    id: web::Path<String>,
    orchestrator: web::Data<Orchestrator>,
    req: HttpRequest
) -> HttpResponse {
    let org_id = id.into_inner();

    let validation = RequestValidator::validate_req(&req, Role::ORGANIZER,
                                                    Some(org_id.as_str()));

    if let Err(e) = validation {
        return e;
    }


    let parsed = orchestrator.get_org_info(org_id).await
        .map_err(|e| {
            error!("{}", e);
            generic_response(StatusCode::INTERNAL_SERVER_ERROR, None, Some(e.to_string()))
        });
    if parsed.is_err() {
        return parsed.unwrap_err();
    }
    generic_response::<OrganizerInfo>(
        StatusCode::OK,
        Some("Successfully found organizer".to_string()),
        Some(parsed.unwrap()),
    )
}