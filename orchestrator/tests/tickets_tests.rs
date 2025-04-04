#[cfg(test)]
mod tests {
    use orchestrator::models::admin_request::AdminRequest;
    use orchestrator::models::api_response::ApiResponse;
    use orchestrator::models::message_resp::MessageResp;
    use orchestrator::models::request_process_info::{RequestProcessInfo, Status};
    use orchestrator::models::tickets::{CancelData, Ticket, TicketReservation, TicketsAddResponse};
    use orchestrator::models::login_data::LoginData;
    use orchestrator::models::user_info::UserInfo;
    use orchestrator::models::user_models::UserRegistration;
    use orchestrator::models::organizer_registration_data::OrganizerRegistrationData;
    use orchestrator::models::org_approve_response::OrgApproveResponse;
    use orchestrator::models::matches::{CreateMatchData, Match};
    use rdkafka::Message;
    use std::sync::Once;
    use log::{LevelFilter, info};
    use orchestrator::utils::general::generate_random_email;
    use pretty_assertions::assert_eq;
    use reqwest::Client;
    use chrono;

    static INIT: Once = Once::new();
    
    fn init_logging() {
        INIT.call_once(|| {
            env_logger::builder()
                .filter_level(LevelFilter::Info)
                .init();
        });
    }
    

    async fn register_and_approve_organizer(client: &Client) -> (String, String, String) {
        // Регистрация организатора
        let login = generate_random_email();
        let user_data = OrganizerRegistrationData {
            email: login.clone(),
            company: "Test Company 228".to_string(),
            tin: "555889923022".to_string(),
            phone_number: "+79150692787".to_string(),
        };

        let register_url = "http://localhost:8000/api/auth/register/organizer".to_string();
        let response = client.post(&register_url)
            .json(&user_data)
            .send()
            .await
            .expect("Ошибка при регистрации организатора");
        
        assert_eq!(response.status().is_success(), true);

        // Логин админа
        let admin_login_data = LoginData {
            login: "admin1".to_string(),
            password: "admin1".to_string(),
        };

        let login_url = "http://localhost:8000/api/auth/login".to_string();
        let response = client.post(&login_url)
            .json(&admin_login_data)
            .send()
            .await
            .expect("Ошибка при логине админа");
        
        assert_eq!(response.status().is_success(), true);

        // Получение списка заявок
        let get_requests_url = "http://localhost:8000/api/admin/requests".to_string();
        let response = client.get(&get_requests_url)
            .send()
            .await
            .expect("Ошибка при получении списка заявок");
        
        assert_eq!(response.status().is_success(), true);
        let requests_response: ApiResponse<Vec<AdminRequest>> = response.json::<ApiResponse<Vec<AdminRequest>>>().await.expect("Ошибка при десериализации списка заявок");
        let request_id = requests_response.data.unwrap().first().unwrap().request_id.clone();

        // Подтверждение заявки
        let body = RequestProcessInfo {
                request_id,
                status: Status::APPROVED
        };
        let approve_url = format!("http://localhost:8000/api/admin/process");

        let response = client.post(&approve_url)
            .json(&body)
            .send()
            .await
            .expect("Ошибка при подтверждении заявки");
        
        assert_eq!(response.status().is_success(), true);
        let approve_response = response.json::<ApiResponse<OrgApproveResponse>>().await.expect("Ошибка при десериализации ответа");
        let org_credentials = approve_response.data.unwrap();

        // Логин организатора
        let login_data = LoginData {
            login: org_credentials.login.clone(),
            password: org_credentials.password.clone(),
        };

        let response = client.post(&login_url)
            .json(&login_data)
            .send()
            .await
            .expect("Ошибка при логине организатора");
        
        assert_eq!(response.status().is_success(), true);
        let jwt_response = response.json::<ApiResponse<UserInfo>>().await.expect("Ошибка при десериализации JWT");

        (org_credentials.login, org_credentials.password, jwt_response.data.unwrap().user_id)
    }

    async fn register_user(client: &Client) -> (String, String) {
        let login = generate_random_email();
        let user_data = UserRegistration {
            name: "Test".to_string(),
            last_name: "User".to_string(),
            email: login.clone(),
            password: "test_password123".to_string(),
            login: login.clone(),
        };

        let register_url = "http://localhost:8000/api/auth/register/user".to_string();
        let response = client.post(&register_url)
            .json(&user_data)
            .send()
            .await
            .expect("Ошибка при регистрации пользователя");
        
        assert_eq!(response.status().is_success(), true);

        let login_data = LoginData {
            login: user_data.email.clone(),
            password: user_data.password.clone(),
        };

        let login_url = "http://localhost:8000/api/auth/login".to_string();
        let response = client.post(&login_url)
            .json(&login_data)
            .send()
            .await
            .expect("Ошибка при логине пользователя");
        
        assert_eq!(response.status().is_success(), true);
        let jwt_response = response.json::<ApiResponse<UserInfo>>().await.expect("Ошибка при десериализации JWT");
        let auth_id = jwt_response.data.unwrap().user_id;

        (login, auth_id)
    }

    #[tokio::test]
    async fn tickets_pipeline() {
        init_logging();
        info!("Starting tickets pipeline test");

        let client = reqwest::Client::builder().cookie_store(true).build().expect("Ошибка при создании клиента");

        // 1. Регистрация и подтверждение организатора
        let (org_login, org_password, org_auth_id) = register_and_approve_organizer(&client).await;
        info!("Organizer registered and approved: {}", org_login);

        // 2. Создание матча организатором
        let match_data = CreateMatchData {
            team_home: "Team A".to_string(),
            team_away: "Team B".to_string(),
            match_date_time: chrono::Utc::now() + chrono::Duration::days(30),
            stadium: "Test Stadium".to_string(),
            match_description: "Test Description".to_string(),
        };

        let login_data = LoginData {
            login: org_login.clone(),
            password: org_password.clone(),
        };
        
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
        info!("Organizer: {:?}", jwt_response.data.unwrap());

        let create_match_url = format!("http://localhost:8000/api/matches/{}", org_auth_id);
        let response = client.post(&create_match_url)
            .json(&match_data)
            .send()
            .await
            .expect("Ошибка при создании матча");
        
        let match_response = response.json::<ApiResponse<Match>>().await.expect("Ошибка при десериализации матча");
        let match_id = match_response.data.unwrap().id;
        info!("Match created with ID: {}", match_id);

        // Загрузка файла с билетами
        let file_path = "tests/tickets1.csv";
        let file = tokio::fs::File::open(file_path).await.expect("Не удалось открыть файл");
        let file_stream = reqwest::Body::from(file);

        // Создаем multipart форму
        let form = reqwest::multipart::Form::new()
            .text("field_name", "field_value") // Другие поля, если нужно
            .part("tickets", reqwest::multipart::Part::stream(file_stream)
                .file_name(std::path::Path::new(file_path).file_name().unwrap().to_string_lossy().to_string())
                .mime_str("application/octet-stream").unwrap());


        let create_tickets_url = format!("http://localhost:8000/api/tickets/{}", match_id);
        let response = client.post(&create_tickets_url)
            .multipart(form)
            .send()
            .await
            .expect("Ошибка при создании билетов");
        
        assert_eq!(response.status().is_success(), true);
        let tickets_response = response.json::<ApiResponse<TicketsAddResponse>>().await.expect("Ошибка при десериализации билетов");
        info!("Tickets added: {:?}", tickets_response);

        let get_match_tickets_url = format!("http://localhost:8000/api/tickets/{}", match_id);
        let response = client.get(&get_match_tickets_url)
            .send()
            .await
            .expect("Ошибка при получении билетов матча");
        
        assert_eq!(response.status().is_success(), true);
        let match_tickets = response.json::<ApiResponse<Vec<Ticket>>>().await.expect("Ошибка при десериализации билетов");
        let ticket_id = match_tickets.data.unwrap().get(3).unwrap().id.clone();
        info!("Ticket id: {:?}", ticket_id);

        // 4. Регистрация пользователя
        let (user_login, user_auth_id) = register_user(&client).await;
        info!("User registered: {}", user_login);

        // 5. Резервирование билета пользователем
        let reservation_data = TicketReservation {
            user_id: user_auth_id.clone(),
            match_id: match_id.clone(),
        };

        let reserve_url = format!("http://localhost:8000/api/tickets/preorder/{}", ticket_id);
        let response = client.put(&reserve_url)
            .json(&reservation_data)
            .send()
            .await
            .expect("Ошибка при резервировании билета");
        
        info!("Response status: {}", response.status());
        let text = response.text().await.expect("Ошибка при получении текста ответа");
        info!("Ticket reserved with ID: {}", text);

        // 6. Получение билетов пользователя
        let get_user_tickets_url = format!("http://localhost:8000/api/tickets/user/{}", user_auth_id);
        let response = client.get(&get_user_tickets_url)
            .send()
            .await
            .expect("Ошибка при получении билетов пользователя");
        
        let user_tickets = response.json::<ApiResponse<Vec<Ticket>>>().await.expect("Ошибка при десериализации билетов");
        assert_eq!(user_tickets.data.unwrap().len(), 1);
        info!("User has 1 reserved ticket");

        // 7. Отмена резервирования
        let cancel_data = CancelData {
            match_id: match_id.clone(),
            user_id: user_auth_id.clone(),
        };

        let cancel_url = format!("http://localhost:8000/api/tickets/cancel/{}", ticket_id);
        let response = client.put(&cancel_url)
            .json(&cancel_data)
            .send()
            .await
            .expect("Ошибка при отмене резервирования");
        
        assert_eq!(response.status().is_success(), true);
        info!("Ticket reservation cancelled");

        // 8. Проверка, что билеты больше не принадлежат пользователю
        let response = client.get(&get_user_tickets_url)
            .send()
            .await
            .expect("Ошибка при получении билетов пользователя");
        
        assert_eq!(response.status().is_success(), true);
        let user_tickets = response.json::<ApiResponse<Vec<Ticket>>>().await.expect("Ошибка при десериализации билетов");
        assert_eq!(user_tickets.data.unwrap().len(), 0);
        info!("User has no tickets after cancellation");

    }
}

