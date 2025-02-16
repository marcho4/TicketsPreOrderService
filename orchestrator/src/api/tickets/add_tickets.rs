use std::io::Write;
use actix_web::{post, web, HttpRequest, HttpResponse};
use actix_multipart::Multipart;
use actix_web::http::StatusCode;
use futures::{StreamExt, TryStreamExt};
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::responses::generic_response;
use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use crate::models::api_response::ApiResponse;
use crate::models::roles::Role;
use crate::models::tickets::TicketsAddResponse;
use crate::utils::request_validator::RequestValidator;

/// Описание multipart-формы для загрузки билетов
#[derive(Serialize, Deserialize, ToSchema)]
pub struct TicketsMultipart {
    /// Файл с билетами.
    #[schema(value_type = String, format = "binary")]
    pub tickets: String,
}

#[utoipa::path(
    post,
    path = "/{match_id}",
    operation_id = "addTickets",
    tag = "Tickets",
    params(
        ("match_id" = String, Path, description = "ID матча, для которого добавляются билеты")
    ),
    request_body(
        content = TicketsMultipart,
        description = "Multipart-форма, содержащая файл с билетами в поле `tickets`",
        content_type = "multipart/form-data"
    ),
    responses(
        (status = 200, description = "Билеты успешно добавлены", body = ApiResponse<TicketsAddResponse>),
        (status = 400, description = "Некорректный запрос", body = ApiResponse<String>),
        (status = 500, description = "Внутренняя ошибка сервера", body = ApiResponse<String>)
    )
)]
#[post("/{match_id}")]
pub async fn add_tickets(
    orchestrator: web::Data<Orchestrator>,
    match_id: web::Path<String>,
    mut payload: Multipart,
    req: HttpRequest
) -> HttpResponse {
    let match_id = match_id.into_inner();

    let match_data = match orchestrator.get_match(&match_id).await {
        Ok(match_data) => match_data,
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

    while let Some(item) = payload.next().await {
        if let Ok(mut field) = item {
            let cd = field.content_disposition();

            if let Some(cd) = cd {
                if let Some(field_name) = cd.get_name() {
                    if field_name == "tickets" {
                        let filename: String = thread_rng()
                            .sample_iter(&Alphanumeric)
                            .take(10)
                            .map(char::from)
                            .collect();

                        let file_path = format!("{}/tmp/{}", env!("CARGO_MANIFEST_DIR"), filename);
                        let another_file_path = file_path.clone();

                        let mut f = match web::block(move || std::fs::File::create(&file_path)).await {
                            Ok(Ok(file)) => file,
                            Ok(Err(e)) => {
                                return generic_response::<String>(
                                    StatusCode::INTERNAL_SERVER_ERROR,
                                    Some(format!("Error while creating file on server: {e}")),
                                    None
                                );
                            }
                            Err(_) => return generic_response::<String>(
                                StatusCode::INTERNAL_SERVER_ERROR,
                                Some("Random error while creating file. Try again".to_string()),
                                None
                            )
                        };

                        // Читаем multipart-поток и записываем в файл
                        while let Ok(Some(chunk)) = field.try_next().await {

                            // Запись в файл (снова в threadpool)
                            f = match web::block(move || {
                                match f.write_all(&chunk) {
                                    Ok(()) => Ok(f),
                                    Err(e) => Err(e),
                                }
                            }).await {
                                Ok(Ok(file)) => file,
                                Ok(Err(e)) => {
                                    return generic_response::<String>(
                                        StatusCode::INTERNAL_SERVER_ERROR,
                                        Some(format!("Не удалось записать файл: {e}")),
                                        None
                                    );
                                },
                                Err(_) => return generic_response::<String>(
                                    StatusCode::INTERNAL_SERVER_ERROR,
                                    Some("Random error while writing file. Try again".to_string()),
                                    None
                                )
                            };
                        }

                        return match orchestrator.add_match_tickets(&match_id, &another_file_path).await {
                            Ok(res) => {
                                generic_response::<TicketsAddResponse>(StatusCode::OK,
                                          Some("Successfully added tickets".to_string()), Some(res))
                            },
                            Err(e) => {
                                generic_response::<String>(
                                    StatusCode::INTERNAL_SERVER_ERROR,
                                    Some(format!("Ошибка при обработке файла Orchestrator'ом: {e}")),
                                    None
                                )
                            }
                        };
                    }
                }
            }
        } else if let Err(e) = item {
            return generic_response::<String>(
                StatusCode::BAD_REQUEST,
                Some(format!("Error reading multipart: {e}")),
                None
            );
        } else {
            break;
        }
    }

    generic_response::<String>(
        StatusCode::BAD_REQUEST,
        Some("File \"tickets\" not found in the request".to_string()),
        None
    )
}