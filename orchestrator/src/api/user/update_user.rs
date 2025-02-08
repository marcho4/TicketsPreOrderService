use actix_web::{put, web, HttpResponse};
use actix_web::http::StatusCode;
use crate::models::message_resp::MessageResp;
use crate::models::user_models::UserUpdateData;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;

#[put("/{id}/update")]
pub async fn update_user(id: web::Path<String>, data: web::Json<UserUpdateData>,
                         orchestrator: web::Data<Orchestrator>) -> HttpResponse {

    match orchestrator.update_user(data.into_inner(), id.into_inner()).await {
        Ok(okk) => {
            generic_response::<MessageResp>(StatusCode::OK, Some("Successfully updated.".to_string()),Some(okk))
        }
        Err(e) => {
            generic_response::<String>(
                StatusCode::INTERNAL_SERVER_ERROR,
                Some("Update error".to_string()),
                Some(e.to_string())
            )
        }
    }
}