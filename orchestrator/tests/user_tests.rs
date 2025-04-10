#[cfg(test)]
mod tests {
    use orchestrator::models::general::ApiResponse;
    use orchestrator::models::user::UserInfo;
    use orchestrator::models::user::{User, UserRegistration};
    use orchestrator::models::auth::AuthRequest;
    use std::sync::Once;
    use log::LevelFilter;
    use orchestrator::utils::general::generate_random_email;
    use pretty_assertions::assert_eq;
    use log::info;

    static INIT: Once = Once::new();
    
    fn init_logging() {
        INIT.call_once(|| {
            env_logger::builder()
                .filter_level(LevelFilter::Info)
                .init();
        });
    }

    pub async fn register_and_approve_user(client: &reqwest::Client) -> (String, UserInfo) {
        let login = generate_random_email();
        let user_data = UserRegistration {
            name: "Test".to_string(),
            last_name: "User".to_string(),
            email: login.clone(),
            password: "test_password123".to_string(),
            login: login.clone(),
            birthday: "01.01.2000".to_string(),
            phone: "1234567890".to_string(),
        };

        let register_url = "http://localhost:8000/api/auth/register/user".to_string();
        let response = client.post(&register_url)
            .json(&user_data)
            .send()
            .await
            .expect("Ошибка при регистрации пользователя");
        
        assert_eq!(response.status().is_success(), true);


        let login_data = AuthRequest {
            login: login.clone(),
            password: "test_password123".to_string(),
        };
        let login_url = "http://localhost:8000/api/auth/login".to_string();
        let response = client.post(&login_url)
            .json(&login_data)
            .send()
            .await
            .expect("Ошибка при логине пользователя");
        let auth_id = response.json::<ApiResponse<UserInfo>>().await.expect("Ошибка при десериализации информации о пользователе").data.unwrap();
        (login, auth_id)
    }

    #[tokio::test]
    async fn test_get_user_info() {
        init_logging();
        let client = reqwest::Client::builder().cookie_store(true).build().expect("Ошибка при создании клиента");

        let (_, auth_id) = register_and_approve_user(&client).await;

        // Получение информации о пользователе
        let get_user_url = format!("http://localhost:8000/api/user/{}", auth_id.user_id);
        let response = client.get(&get_user_url)
            .send()
            .await
            .expect("Ошибка при получении информации о пользователе");
        
        assert_eq!(response.status().is_success(), true);
        let user_info = response.json::<ApiResponse<User>>().await.expect("Ошибка при десериализации информации о пользователе").data.unwrap();
        assert_eq!(user_info.id, auth_id.user_id);
        assert_eq!(user_info.name, "Test");
        assert_eq!(user_info.last_name, "User");
    }

    #[tokio::test]
    async fn test_update_user_profile() {
        init_logging();
        let client = reqwest::Client::builder().cookie_store(true).build().expect("Ошибка при создании клиента");

        let (_, auth_id) = register_and_approve_user(&client).await;

        // Обновление профиля пользователя
        let update_data = serde_json::json!({
            "birthday": "2025-01-01",
            "email": "test@test.com",
            "last_name": "Updated",
            "name": "Updated",
            "phone": "+79150692787"
          });

        let update_user_url = format!("http://localhost:8000/api/user/{}/update", auth_id.user_id);
        let response = client.put(&update_user_url)
            .json(&update_data)
            .send()
            .await
            .expect("Ошибка при обновлении профиля пользователя");
        
        let text = response.text().await.expect("Ошибка при получении текста ответа");
        info!("Ответ: {}", text);

        // Проверка обновленных данных
        let get_user_url = format!("http://localhost:8000/api/user/{}", auth_id.user_id);
        let response = client.get(&get_user_url)
            .send()
            .await
            .expect("Ошибка при получении информации о пользователе");
        
        assert_eq!(response.status().is_success(), true);
        let user_info = response.json::<ApiResponse<User>>().await.expect("Ошибка при десериализации информации о пользователе").data.unwrap();
        assert_eq!(user_info.id, auth_id.user_id);
        assert_eq!(user_info.name, "Updated");
        assert_eq!(user_info.last_name, "Updated");
        assert_eq!(user_info.email, "test@test.com");
        assert_eq!(user_info.phone, "+79150692787");
        assert_eq!(user_info.birthday, "2025-01-01");
    }
}
