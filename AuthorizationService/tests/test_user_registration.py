import pytest
import requests

BASE_URL = "http://localhost:8081"  # Замените на ваш базовый URL


@pytest.mark.parametrize('data, expected_status_code, expected_status_message', [
    # тест на пустые поля
    (
            {"name": "Nazar",
             "last_name": "",
             "email": "nazarzakrevski@gmail.com"},
            400,  # status code
            "fill every field!"  # response
    ),
    # корректный тест
    (
            {"name": "Nazar",
             "last_name": "Zakrevski",
             "email": "nazarzakrevski@gmail.com"},
            200,  # status code
            "User registered"  # response
    ),
    # тест на не валидность email
    (
            {"name": "Nazar",
             "last_name": "Zakrevski",
             "email": "invalid_email"},
            400,  # status code
            "email already exists or email invalid"  # response
    ),
])
def test_register_user(data, expected_status_code, expected_status_message):
    response = requests.post(f"{BASE_URL}/register_user", json=data)
    assert response.status_code == expected_status_code
    response_data = response.json()
    assert response_data["status"] == expected_status_message
    if response.status_code == 200:
        assert response_data["name"] == "Nazar"
        assert response_data["last_name"] == "Zakrevski"
        assert response_data["email"] == "nazarzakrevski@gmail.com"
