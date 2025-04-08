#[cfg(test)]
mod tests {
    use orchestrator::models::general::ApiResponse;
    use orchestrator::models::matches::{Match, CreateMatchData, UpdateMatchData};
    use orchestrator::models::auth::AuthRequest;
    use orchestrator::models::organizer::OrgApproveResponse;
    use orchestrator::models::organizer::OrganizerRegistrationData;
    use orchestrator::models::user::UserInfo;
    use chrono::Utc;
    use orchestrator::orchestrator::orchestrator::Orchestrator;
    use std::sync::Once;
    use log::{info, LevelFilter};
    use orchestrator::utils::general::generate_random_email;
    use pretty_assertions::assert_eq;
    use reqwest::StatusCode;
    use orchestrator::models::admin::{RequestProcessInfo, Status};
    use serial_test::serial;

    static INIT: Once = Once::new();
    const CONFIG_PATH: &str = "src/orchestrator/dev.toml";
    
    fn init_logging() {
        INIT.call_once(|| {
            env_logger::builder()
                .filter_level(LevelFilter::Info)
                .init();
        });
    }

    #[tokio::test]
    #[serial]
    async fn test_create_and_get_match() {
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
            company: "Test Company 232".to_string(),
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

        let body = RequestProcessInfo {
            request_id: first_id,
            status: Status::APPROVED
        };
        let approve_url = "http://localhost:8000/api/admin/process".to_string();
        let response = client.post(&approve_url)
            .json(&body)
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
        
        // Создание матча
        let match_data = CreateMatchData {
            team_home: "Team A".to_string(),
            team_away: "Team B".to_string(),
            match_date_time: Utc::now() + chrono::Duration::days(7),
            stadium: "Stadium 1".to_string(),
            match_description: "Test match".to_string(),
        };
        info!("Creating match: {} vs {}", match_data.team_home, match_data.team_away);

        let create_match_url = format!("http://localhost:8000/api/matches/{}", jwt_response.data.unwrap().user_id);
        let response = client.post(&create_match_url)
            .json(&match_data)
            .send()
            .await
            .expect("Ошибка при создании матча");
        
        assert_eq!(response.status().is_success(), true);
        let match_response = response.json::<ApiResponse<Match>>().await.expect("Ошибка при десериализации матча");
        let match_id = match_response.data.unwrap().id;
        info!("Match created successfully with ID: {}", match_id);

        // Получение информации о матче
        let get_match_url = format!("http://localhost:8000/api/matches/{}", match_id);
        info!("Getting match details from: {}", get_match_url);
        let response = client.get(&get_match_url)
            .send()
            .await
            .expect("Ошибка при получении информации о матче");
        
        assert_eq!(response.status().is_success(), true);
        let match_info = response.json::<ApiResponse<Match>>().await.expect("Ошибка при десериализации матча");
        assert_eq!(match_info.data.unwrap().team_home, "Team A");
        info!("Match details retrieved successfully");
        info!("Test completed successfully");
    }

    #[tokio::test]
    #[serial]
    async fn test_update_match_details() {
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
            company: "Test Company 2332".to_string(),
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
        let body = RequestProcessInfo {
            request_id: first_id,
            status: Status::APPROVED
        };
        let response = client.post(&approve_url)
            .json(&body)
            .send()
            .await
            .expect("Ошибка при одобрении организатора");

        let response_status = response.status();
        info!("Response status: {}", response_status);
        assert_eq!(response_status == StatusCode::OK, true);

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

        // Создание матча   
        let match_data = CreateMatchData {
            team_home: "Team A".to_string(),
            team_away: "Team B".to_string(),
            match_date_time: Utc::now() + chrono::Duration::days(7),
            stadium: "Stadium 1".to_string(),
            match_description: "Test match".to_string(),
        };
        info!("Creating match: {} vs {}", match_data.team_home, match_data.team_away);

        let create_match_url = format!("http://localhost:8000/api/matches/{}", jwt_response.data.unwrap().user_id);
        let response = client.post(&create_match_url)
            .json(&match_data)
            .send()
            .await
            .expect("Ошибка при создании матча");
        
        assert_eq!(response.status().is_success(), true);
        let match_response = response.json::<ApiResponse<Match>>().await.expect("Ошибка при десериализации матча");
        let match_id = match_response.data.unwrap().id;
        info!("Match created successfully with ID: {}", match_id);

        // Обновление информации о матче
        let update_data = UpdateMatchData {
            match_description: "Updated match description".to_string(),
            stadium: "New Stadium".to_string(),
            match_date_time: Utc::now() + chrono::Duration::days(14),
        };

        let update_match_url = format!("http://localhost:8000/api/matches/{}", match_id);
        let response = client.put(&update_match_url)
            .json(&update_data)
            .send()
            .await
            .expect("Ошибка при обновлении матча");
        
        assert_eq!(response.status().is_success(), true);

        // Проверка обновленных данных
        let get_match_url = format!("http://localhost:8000/api/matches/{}", match_id);
        let response = client.get(&get_match_url)
            .send()
            .await
            .expect("Ошибка при получении информации о матче");
        
        assert_eq!(response.status().is_success(), true);
        let match_info = response.json::<ApiResponse<Match>>().await.expect("Ошибка при десериализации матча");
        let updated_match = match_info.data.unwrap();
        assert_eq!(updated_match.match_description, "Updated match description");
    }

}
