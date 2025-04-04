#[cfg(test)]
mod tests {
    use orchestrator::models::api_response::ApiResponse;
    use orchestrator::models::payments::{PaymentRequest, PaymentResponse, PaymentStatus, Refund};
    use orchestrator::models::login_data::LoginData;
    use orchestrator::models::user_info::UserInfo;
    use orchestrator::models::user_models::UserRegistration;
    use std::sync::Once;
    use log::LevelFilter;
    use orchestrator::utils::general::generate_random_email;
    use pretty_assertions::assert_eq;

    static INIT: Once = Once::new();
    
    fn init_logging() {
        INIT.call_once(|| {
            env_logger::builder()
                .filter_level(LevelFilter::Info)
                .init();
        });
    }

    #[tokio::test]
    async fn test_create_payment() {
        init_logging();
        let client = reqwest::Client::builder().cookie_store(true).build().expect("Ошибка при создании клиента");

        // Регистрация и логин пользователя
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
        let auth_id = jwt_response.data.unwrap().auth_id;

        // Создание платежа
        let payment_data = PaymentRequest {
            user_id: auth_id.clone(),
            amount: "1000".to_string(),
            currency: "RUB".to_string(),
            provider: "test_provider".to_string(),
            match_id: "test_match_id".to_string(),
            ticket_id: "test_ticket_id".to_string(),
        };

        let create_payment_url = "http://localhost:8000/api/payments".to_string();
        let response = client.post(&create_payment_url)
            .header("Authorization", format!("Bearer {}", auth_id))
            .json(&payment_data)
            .send()
            .await
            .expect("Ошибка при создании платежа");
        
        assert_eq!(response.status().is_success(), true);
        let payment_response = response.json::<ApiResponse<PaymentResponse>>().await.expect("Ошибка при десериализации ответа");
        assert!(payment_response.data.unwrap().payment_url.len() > 0);
    }

    #[tokio::test]
    async fn test_check_payment_status() {
        init_logging();
        let client = reqwest::Client::builder().cookie_store(true).build().expect("Ошибка при создании клиента");

        // Регистрация и логин пользователя
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
        let auth_id = jwt_response.data.unwrap().auth_id;

        // Создание платежа
        let payment_data = PaymentRequest {
            user_id: auth_id.clone(),
            amount: "1000".to_string(),
            currency: "RUB".to_string(),
            provider: "test_provider".to_string(),
            match_id: "test_match_id".to_string(),
            ticket_id: "test_ticket_id".to_string(),
        };

        let create_payment_url = "http://localhost:8000/api/payments".to_string();
        let response = client.post(&create_payment_url)
            .header("Authorization", format!("Bearer {}", auth_id))
            .json(&payment_data)
            .send()
            .await
            .expect("Ошибка при создании платежа");
        
        assert_eq!(response.status().is_success(), true);
        let payment_response = response.json::<ApiResponse<PaymentResponse>>().await.expect("Ошибка при десериализации ответа");
        let payment_id = payment_response.data.unwrap().payment_id;

        // Проверка статуса платежа
        let status_url = format!("http://localhost:8000/api/payments/{}/status", payment_id);
        let response = client.get(&status_url)
            .header("Authorization", format!("Bearer {}", auth_id))
            .send()
            .await
            .expect("Ошибка при проверке статуса платежа");
        
        assert_eq!(response.status().is_success(), true);
        let status_response = response.json::<ApiResponse<PaymentStatus>>().await.expect("Ошибка при десериализации статуса");
        assert_eq!(status_response.data.unwrap().status, "pending");
    }

    #[tokio::test]
    async fn test_process_refund() {
        init_logging();
        let client = reqwest::Client::builder().cookie_store(true).build().expect("Ошибка при создании клиента");

        // Регистрация и логин пользователя
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
        let auth_id = jwt_response.data.unwrap().auth_id;

        // Создание платежа
        let payment_data = PaymentRequest {
            user_id: auth_id.clone(),
            amount: "1000".to_string(),
            currency: "RUB".to_string(),
            provider: "test_provider".to_string(),
            match_id: "test_match_id".to_string(),
            ticket_id: "test_ticket_id".to_string(),
        };

        let create_payment_url = "http://localhost:8000/api/payments".to_string();
        let response = client.post(&create_payment_url)
            .header("Authorization", format!("Bearer {}", auth_id))
            .json(&payment_data)
            .send()
            .await
            .expect("Ошибка при создании платежа");
        
        assert_eq!(response.status().is_success(), true);
        let payment_response = response.json::<ApiResponse<PaymentResponse>>().await.expect("Ошибка при десериализации ответа");
        let payment_id = payment_response.data.unwrap().payment_id;

        // Обработка возврата
        let refund_data = Refund {
            refund_id: "test_refund_id".to_string(),
            payment_id: payment_id.clone(),
            user_id: auth_id.clone(),
            status: "pending".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
        };

        let refund_url = format!("http://localhost:8000/api/payments/{}/refund", payment_id);
        let response = client.post(&refund_url)
            .header("Authorization", format!("Bearer {}", auth_id))
            .json(&refund_data)
            .send()
            .await
            .expect("Ошибка при обработке возврата");
        
        assert_eq!(response.status().is_success(), true);
    }
}
