use actix_web::{put, web, HttpRequest, Responder};
use actix_web::http::StatusCode;
use crate::models::general::ApiResponse;
use crate::models::matches::{Match, UpdateMatchData};
use crate::models::general::Role;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::request_validator::RequestValidator;
use crate::utils::responses::generic_response;

#[utoipa::path(
    put,
    path = "/api/matches/{match_id}",
    tag = "Matches",
    description = "Update match info",
    summary = "Обновить данные матч",
    params(
        ("match_id" = String, Path, description = "Уникальный идентификатор матча")
    ),
    request_body = UpdateMatchData,
    responses(
        (status = 200, description = "Successfully updated", body = ApiResponse<Match>),
        (status = 500, description = "Error", body = ApiResponse<String>)
    )
)]
#[put("/{match_id}")]
pub async fn update_match(
    orchestrator: web::Data<Orchestrator>,
    match_id: web::Path<String>,
    data: web::Json<UpdateMatchData>,
    req: HttpRequest
) -> impl Responder {
    let data = data.into_inner();
    let match_id = match_id.into_inner();

    let match_data = match orchestrator.get_match(&match_id).await {
        Ok(match_data) => {
            match_data
        },
        Err(e) => {
            return generic_response::<String>(
                StatusCode::INTERNAL_SERVER_ERROR,
                Some("Error getting info about match before updating".into()),
                Option::from(e.to_string()));
        }
    };

    let validation = RequestValidator::validate_req(&req,
                                                    Role::ORGANIZER,
                                                    Some(match_data.organizer_id.as_str()));
    if let Err(e) = validation {
        return e;
    }

    match orchestrator.update_match(&match_id, data).await {
        Ok(matches) => {
            generic_response::<Match>(StatusCode::OK, Some("Success".into()), Some(matches))
        },
        Err(e) => {
            generic_response::<String>(StatusCode::INTERNAL_SERVER_ERROR, Some("Error".into()), Option::from(e.to_string()))
        }
    }
}