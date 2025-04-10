#[cfg(test)]
mod tests {
    use orchestrator::models::auth::AuthRequest;
    use orchestrator::models::general::MessageResp;
    use orchestrator::models::organizer::OrgApproveResponse;
    use orchestrator::models::organizer::OrganizerRegistrationData;
    use orchestrator::models::update_org_data::UpdateOrgData;
    use orchestrator::{models::general::ApiResponse, orchestrator::orchestrator::Orchestrator};
    use orchestrator::models::user::UserInfo;
    use serde_json::json;
    use std::sync::Once;
    use log::{LevelFilter, info};
    use orchestrator::utils::general::generate_random_email;
    use pretty_assertions::assert_eq;

    const CONFIG_PATH: &str = "src/orchestrator/dev.toml";

    static INIT: Once = Once::new();
    
    fn init_logging() {
        INIT.call_once(|| {
            env_logger::builder()
                .filter_level(LevelFilter::Info)
                .init();
        });
    }

    #[tokio::test]
    async fn test_create_and_update_organizer() {
        init_logging();
        info!("Starting test_create_and_get_match");
        let admin_login_data = AuthRequest {
            login: String::from("admin1"),
            password: String::from("admin1"),
        };
        let client = reqwest::Client::builder().cookie_store(true).build().expect("Ошибка при создании клиента");
        let orchestrator = Orchestrator::new(CONFIG_PATH).await;
        info!("Orchestrator initialized");

        // Регистрация и логин организатора
        let login = generate_random_email();
        info!("Generated random email for organizer: {}", login);

        let user_data = OrganizerRegistrationData {
            email: login.clone(),
            company: "Test Company 23234".to_string(),
            tin: "555889923022".to_string(),
            phone_number: "+79150692787".to_string(),
        };

        let register_url = "http://localhost:8000/api/auth/register/organizer".to_string();
        info!("Registering organizer at: {}", register_url);
        let response = client.post(&register_url)
            .json(&user_data)
            .send()
            .await
            .expect("Ошибка при регистрации организатора");
        assert_eq!(response.status().is_success(), true);
        info!("Organizer registration successful");

        // Логин администратора
        let login_url = "http://localhost:8000/api/auth/login".to_string();
        info!("Logging in as admin at: {}", login_url);
        let response = client.post(&login_url)
            .json(&admin_login_data)
            .send()
            .await
            .expect("Ошибка при логине организатора");
        assert_eq!(response.status().is_success(), true);
        info!("Admin login successful");

        let requests = orchestrator.get_admin_requests().await.expect("Не удалось получить заявки");
        info!("Retrieved {} admin requests", requests.len());

        let first_id = requests.get(0);
        assert_eq!(first_id.is_some(), true);

        let first_id = first_id.unwrap().request_id.clone();
        info!("Processing request with ID: {}", first_id);

        let approve_url = "http://localhost:8000/api/admin/process".to_string();
        let response = client.post(&approve_url)
            .json(&json!(
                {
                    "request_id": first_id.clone(),
                    "status": "APPROVED"
                }))
            .send()
            .await
            .expect("Ошибка при одобрении организатора");

        assert_eq!(response.status().is_success(), true);
        
        info!("Organizer approval successful");
        let text = response.json::<ApiResponse<OrgApproveResponse>>().await.expect("Не удалось получить текст ответа");
        
        info!("Organizer registration successful");
        let login = text.data.clone().unwrap();
        let login_data = AuthRequest {
            login: login.login.clone(),
            password: login.password.clone(),
        };

        // Логин организатора
        let login_url = "http://localhost:8000/api/auth/login".to_string();
        info!("Logging in as organizer at: {}", login_url);
        let response = client.post(&login_url)
            .json(&login_data)
            .send()
            .await
            .expect("Ошибка при логине организатора");

        assert_eq!(response.status().is_success(), true);
        let jwt_response = response.json::<ApiResponse<UserInfo>>().await.expect("Ошибка при десериализации JWT");
        info!("Organizer login successful");

        // Update organizer
        let update_url = format!("http://localhost:8000/api/organizer/update/{}", jwt_response.data.unwrap().user_id);
        let update_data = UpdateOrgData {
            organization_name: "Updated Company2 ".to_string(),
            email: "test2312@test.com".to_string(),
            phone_number: "79150692787".to_string(),
            tin: "555889923022".to_string(),
        };
        let response = client.put(&update_url)
            .json(&update_data)
            .send()
            .await
            .expect("Ошибка при обновлении организатора");
        assert_eq!(response.status().is_success(), true);
        let text = response.json::<ApiResponse<MessageResp>>().await.expect("Не удалось получить текст ответа");
        info!("Organizer updated successfully");
        info!("Updated text: {}", text.msg.unwrap());
    }
}
