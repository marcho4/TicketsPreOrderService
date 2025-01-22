use actix_web::{get, web, HttpResponse};
use crate::models::api_response::ApiResponse;
use crate::models::organizer_info::OrganizerInfo;
use crate::orchestrator::orchestrator::Orchestrator;

#[get("/get/{id}")]
pub async fn get_organizer(id: web::Path<String>, orch: web::Data<Orchestrator>) -> HttpResponse {
    // Добавить проверку на авторизацию
    let url = format!("http://organizer:8004/get_account_info/{}", id.into_inner());
    let resp = match orch.client.get(&url).send().await {
        Ok(resp) => resp,
        Err(err) => return HttpResponse::InternalServerError()
            .json(ApiResponse::<String> { msg: Some(err.to_string()) , data: None }),
    };
    let parsed = match resp.json::<OrganizerInfo>().await {
        Ok(parsed) => parsed,
        Err(err) => return HttpResponse::InternalServerError()
            .json(ApiResponse::<String> { msg: Some(err.to_string()) , data: None }),
    };

    HttpResponse::Ok().json(ApiResponse::<OrganizerInfo> {
        msg: Some("Successfully found organizer".to_string()),
        data: Some(parsed)
    })
}