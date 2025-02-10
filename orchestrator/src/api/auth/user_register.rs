use crate::models::user_registration_data::UserRegistrationData;
use crate::orchestrator::orchestrator::Orchestrator;
use actix_web::{post, web, HttpRequest, HttpResponse};
use actix_web::http::StatusCode;
use log::info;
use crate::models::api_response::ApiResponse;
use crate::models::message_resp::MessageResp;
use crate::models::user_models::{UserCreateData, UserRegistration};
use crate::utils::errors::OrchestratorError;
use crate::utils::responses::generic_response;

#[utoipa::path(
    post,
    path = "/api/auth/register/user",
    request_body = UserRegistration,
    summary = "Зарегистрироваться как пользователь",
    responses(
        (status = 200, description = "Successfully registered", body = ApiResponse<MessageResp>),
        (status = 400, description = "Bad request. Error in user creation.", body = ApiResponse<String>),
        (status = 500, description = "Internal server error", body = ApiResponse<String>)
    ),
    tag = "Auth"
)]
#[post("/register/user")]
pub async fn register_user(
    orchestrator: web::Data<Orchestrator>,
    data: web::Json<UserRegistration>,
    _req: HttpRequest
) -> HttpResponse {
    // создать name, last_name, email
    // register name, last_name, email, user_id, login, password
    // generate jwt and set to cookies
    let data = data.into_inner();

    let user_create_data = UserCreateData {
        email: data.email.clone(),
        name: data.name.clone(),
        last_name: data.last_name.clone(),
    };

    let creation_result = match orchestrator.create_user(user_create_data).await {
        Ok(user) => user,
        Err(e) => {
            return match e {
                OrchestratorError::Service(msg) => {
                    generic_response::<String>(StatusCode::BAD_REQUEST, Some(msg), None)
                }
                _ => generic_response::<String>(StatusCode::BAD_REQUEST, Some(e.to_string()), None)
            }
        }
    };
    info!("Created user: {:?}", creation_result);

    let register_data = UserRegistrationData {
        name: data.name.clone(),
        last_name: data.email.clone(),
        email: data.email.clone(),
        login: data.login.clone(),
        password: data.password.clone(),
        user_id: creation_result.data.id.clone(),
    };

    let register_result = match orchestrator.user_register(&register_data).await {
        Ok(user) => user,
        Err(e) => {
            return match e {
                OrchestratorError::Service(msg) => {
                    generic_response::<String>(StatusCode::BAD_REQUEST, Some(msg), None)
                }
                OrchestratorError::Request(msg) => {
                    generic_response::<String>(StatusCode::INTERNAL_SERVER_ERROR, Some(msg.to_string()), None)
                }
                _ => generic_response::<String>(StatusCode::INTERNAL_SERVER_ERROR, Some(e.to_string()), None)
            };
        }
    };

    generic_response::<MessageResp>(StatusCode::OK,
        Some("Successfully registered user!".to_string()),
        Some(register_result)
    )

    // let user_info = UserInfo {
    //     user_id: creation_result.data.id.clone(),
    //     auth_id: register_result,
    //     role: Role::USER
    // };
    // let jwt = match orchestrator.generate_jwt(&user_info).await {
    //     Ok(jwt) => jwt,
    //     Err(e) => return generic_response::<String>(StatusCode::INTERNAL_SERVER_ERROR,
    //     None, Some(e.to_string()));
    // };

    // let data = data.into_inner();
    // match orchestrator.user_register(&data).await {
    //     Ok(user) => generic_response::<RegistrationUserResp>(
    //         StatusCode::CREATED,
    //         Some("Successfully registered".to_string()),
    //         Some(user)
    //     ),
    //     Err(e) =>generic_response::<RegistrationUserResp>(
    //         StatusCode::INTERNAL_SERVER_ERROR,
    //         Some(e.to_string()),
    //         None
    //     ),
    // }
}