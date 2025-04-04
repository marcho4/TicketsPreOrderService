#[cfg(test)]
mod tests {
    use orchestrator::models::api_response::ApiResponse;
    use orchestrator::models::user_info::UserInfo;
    use orchestrator::models::login_data::LoginData;
    use orchestrator::models::roles::Role;
    use pretty_assertions::assert_eq;
    use std::sync::Once;
    use log::{LevelFilter, info};
    use orchestrator::utils::general::generate_random_email;
    use orchestrator::models::user_models::UserRegistration;
    use orchestrator::models::password_update::PasswordUpdate;

    static INIT: Once = Once::new();
    
    fn init_logging() {
        INIT.call_once(|| {
            env_logger::builder()
                .filter_level(LevelFilter::Info)
                .init();
        });
    }

    #[tokio::test]
    async fn test_user_register_and_login() {
        init_logging();
        let client = reqwest::Client::builder().cookie_store(true).build().expect("Ошибка при создании клиента");

        let login = generate_random_email();
        let user_data = UserRegistration {
            name: "Test".to_string(),
            last_name: "User".to_string(),
            email: login.clone(),
            password: "test_password123".to_string(),
            login: login.clone(),
        };

        let register_url = format!("http://localhost:8000/api/auth/register/user");
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

        let login_url = format!("http://localhost:8000/api/auth/login");
        let response = client.post(&login_url)
            .json(&login_data)
            .send()
            .await
            .expect("Ошибка при логине пользователя");
        
        assert_eq!(response.status().is_success(), true );
        
        let jwt_response = response.json::<ApiResponse<UserInfo>>().await.expect("Ошибка при десериализации JWT");
        assert_eq!(jwt_response.data.is_some(), true);
        assert_eq!(jwt_response.data.unwrap().role, Role::USER);
    }

    #[tokio::test]
    async fn test_password_change() {
        init_logging();
        let client = reqwest::Client::builder().cookie_store(true).build().expect("Ошибка при создании клиента");

        let login = generate_random_email();
        let user_data = UserRegistration {
            email: login.clone(),
            password: "old_password".to_string(),
            login: login.clone(),
            name: "Test".to_string(),
            last_name: "User".to_string(),
        };

        let register_url = format!("http://localhost:8000/api/auth/register/user");
        let response = client.post(&register_url)
            .json(&user_data)
            .send()
            .await
            .expect("Ошибка при регистрации пользователя");
        
        assert!(response.status().is_success());

        // Логин пользователя
        let login_data = LoginData {
            login: user_data.login.clone(),
            password: user_data.password.clone(),
        };

        let login_url = "http://localhost:8000/api/auth/login".to_string();
        let response = client.post(&login_url)
            .json(&login_data)
            .send()
            .await
            .expect("Ошибка при логине пользователя");
        
        assert!(response.status().is_success());
        let _jwt_response = response.json::<ApiResponse<UserInfo>>().await
            .expect("Ошибка при десериализации JWT");

        // Смена пароля
        let new_password = PasswordUpdate {
            password: "new_password".to_string(),
        };

        let change_password_url = "http://localhost:8000/api/auth/password/change".to_string();
        let response = client.put(&change_password_url)
            .json(&new_password)
            .send()
            .await
            .expect("Ошибка при смене пароля");
        
        assert_eq!(response.status().is_success(), true);

        // Попытка логина со старым паролем
        let response = client.post(&login_url)
            .json(&login_data)
            .send()
            .await
            .expect("Ошибка при логине пользователя");
        
        assert!(!response.status().is_success());

        // Логин с новым паролем
        let new_login_data = LoginData {
            login: user_data.login,
            password: new_password.password,
        };

        let response = client.post(&login_url)
            .json(&new_login_data)
            .send()
            .await
            .expect("Ошибка при логине пользователя");
        
        assert_eq!(response.status().is_success(), true);
    }

    #[tokio::test]
    async fn test_wrong_login_or_password() {
        init_logging();
        let client = reqwest::Client::builder().cookie_store(true).build().expect("Ошибка при создании клиента");

        let login = generate_random_email();
        let user_data = UserRegistration {
            email: login.clone(),
            password: "correct_password".to_string(),
            login: login.clone(),
            name: "Test".to_string(),
            last_name: "User".to_string(),
        };

        let register_url = format!("http://localhost:8000/api/auth/register/user");
        let response = client.post(&register_url)
            .json(&user_data)
            .send()
            .await
            .expect("Ошибка при регистрации пользователя");
        
        info!("response: {:?}", response.text().await.unwrap());

        // Попытка логина с неправильным паролем
        let wrong_password_data = LoginData {
            login: user_data.login.clone(),
            password: "wrong_password".to_string(),
        };

        let login_url = format!("http://localhost:8000/api/auth/login");
        let response = client.post(&login_url)
            .json(&wrong_password_data)
            .send()
            .await
            .expect("Ошибка при логине пользователя");
        
        assert_eq!(response.status().is_success(), false);

        // Попытка логина с неправильным логином
        let wrong_login_data = LoginData {
            login: generate_random_email(),
            password: user_data.password.clone(),
        };

        let response = client.post(&login_url)
            .json(&wrong_login_data)
            .send()
            .await
            .expect("Ошибка при логине пользователя");
        
        assert_eq!(response.status().is_success(), false);

        // Попытка логина с правильными данными
        let correct_login_data = LoginData {
            login: user_data.login,
            password: user_data.password,
        };

        let response = client.post(&login_url)
            .json(&correct_login_data)
            .send()
            .await
            .expect("Ошибка при логине пользователя");
        
        assert!(response.status().is_success());
    }
}