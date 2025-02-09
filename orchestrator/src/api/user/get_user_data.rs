use crate::models::user_models::User;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;
use actix_web::http::StatusCode;
use actix_web::{get, web, HttpResponse};

#[get("/{id}")]
pub async fn get_user_data(
    id: web::Path<String>,
    orchestrator: web::Data<Orchestrator>,
) -> HttpResponse {
    match orchestrator.get_user(id.into_inner()).await {
        Ok(user) => generic_response::<User>(StatusCode::OK, Some("Success".into()), Some(user)),
        Err(e) => {
            generic_response::<String>(StatusCode::INTERNAL_SERVER_ERROR, Some(e.to_string()), None)
        }
    }
}
