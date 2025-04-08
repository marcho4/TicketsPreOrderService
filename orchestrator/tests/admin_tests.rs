#[cfg(test)]
mod tests {
    use orchestrator::models::general::ApiResponse;
    use serde_json::json;
    use orchestrator::models::{auth::AuthRequest, organizer::OrgApproveResponse};
    use orchestrator::models::general::Role::ADMIN;
    use orchestrator::orchestrator::orchestrator::Orchestrator;
    use pretty_assertions::assert_eq;
    use orchestrator::models::organizer::OrganizerRegistrationData;
    use std::sync::Once;
    use log::LevelFilter;
    use orchestrator::models::admin::{RequestProcessInfo, Status};
    use orchestrator::utils::general::generate_random_email;

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
    async fn test_admin_login() {
        init_logging();
        let orchestrator = Orchestrator::new(CONFIG_PATH).await;
        let client = reqwest::Client::builder().cookie_store(true).build().expect("Ошибка при создании клиента");

        // Создание аккаунта admin
        let body = json!(
            {
                "api_key": "our-api-key-for-admin-creation",
                "login": "admin1",
                "password": "admin1",
                "email": "mark@gmail.com"
            }
        );
        let response = client.post(format!("{}/admin/create", orchestrator.config.auth_url)).json(&body).send().await;
        assert!(response.is_ok());
        let response = response.unwrap();
        assert!(response.status().is_success());

        let body = AuthRequest {
            login: "admin1".to_string(),
            password: "admin1".to_string(),
        };

        let res = orchestrator.authorize(&body).await;
        assert!(res.is_ok());
        let res = res.unwrap();
        assert_eq!(res.role, ADMIN);

        let requests = orchestrator.get_admin_requests().await.expect("Не удалось получить заявки");
        let prev_length = requests.len();

        // При перезапуске тестов менять Email, идет проверка на уникальность при регистрации
        let org_data = OrganizerRegistrationData {
            company: "Mark & Co".to_string(),
            email: generate_random_email(),
            tin: "111233940098".to_string(),
            phone_number: "+79160889234".to_string(),
        };

        let org_data_2 = OrganizerRegistrationData {
            company: "Mark & Co 2".to_string(),
            email: generate_random_email(),
            tin: "111233578928".to_string(),
            phone_number: "+79160889234".to_string(),
        };
        let url = "http://localhost:8000/api/auth/register/organizer".to_string();

        let res = client.post(&url).json(&org_data_2).send().await.expect("Ошибка при обращении к оркестратору");
        assert!(res.status().is_success());

        let res = client.post(&url).json(&org_data).send().await.expect("Ошибка при обращении к оркестратору");
        assert!(res.status().is_success());

        let login_url = "http://localhost:8000/api/auth/login".to_string();
        let res = client.post(&login_url).json(&body).send().await.expect("Ошибка при обращении к оркестратору");
        assert!(res.status().is_success());

        let requests = orchestrator.get_admin_requests().await.expect("Не удалось получить заявки");
        assert_eq!(requests.len(), prev_length + 2);

        let first_id = requests.get(0);
        assert_eq!(first_id.is_some(), true);
        let first_id = first_id.unwrap();

        let second_id = requests.get(1);
        assert_eq!(second_id.is_some(), true);
        let second_id = second_id.unwrap();

        let approve_url = "http://localhost:8000/api/admin/process".to_string();

        let first_req = RequestProcessInfo {
            request_id: first_id.request_id.clone(),
            status: Status::APPROVED
        };

        let second_req = RequestProcessInfo {
            request_id: second_id.request_id.clone(),
            status: Status::REJECTED
        };

        let res1 = client.post(&approve_url).json(&first_req).send().await.expect("Ошибка при обращении к оркестратору");
        let res1 = res1.json::<ApiResponse<OrgApproveResponse>>().await.expect("Ошибка при десериализации ответа");
        assert_eq!(res1.data.is_some(), true);


        let res2 = client.post(&approve_url).json(&second_req).send().await.expect("Ошибка при обращении к оркестратору");
        let res2 = res2.json::<ApiResponse<OrgApproveResponse>>().await.expect("Ошибка при десериализации ответа");
        assert_eq!(res2.data.is_some(), false);

        let requests = orchestrator.get_admin_requests().await.expect("Не удалось получить заявки");
        assert_eq!(requests.len(), prev_length);
    }
}