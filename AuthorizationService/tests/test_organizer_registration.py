import pytest
import requests
from requests.exceptions import RequestException

BASE_URL = "http://localhost:8081"


@pytest.fixture(scope="module", autouse=True)
def check_server_availability():
    """Ensure the server is running before executing tests."""
    try:
        response = requests.get(f"{BASE_URL}/is_working")
        assert response.status_code == 200
    except RequestException:
        pytest.fail("Невозможно подключиться к серверу. Возможно он не работает")


@pytest.mark.parametrize('data, expected_status_code, expected_status_message', [
    (
            {
                "email": "nazarzakrevskii@gmail.com",
                "company": "Nike pro",
                "tin": "123456789012"
            },
            200,
            "Application sent to admin"
    ),
])
def test_valid_register_organizer(data, expected_status_code, expected_status_message):
    """Регистрация организатора с корректными данными."""
    response = requests.post(f"{BASE_URL}/register_organizer", json=data)
    assert response.status_code == expected_status_code, f"Unexpected status code: {response.status_code}"
    try:
        response_data = response.json()
    except ValueError:
        pytest.fail("Response is not in valid JSON format.")
    assert response_data.get(
        "status") == expected_status_message, f"Unexpected status message: {response_data.get('status')}"


@pytest.mark.parametrize('data, expected_status_code, expected_status_message, expected_message', [
    (
            {
                "email": "nazarzakrevskii@",
                "company": "Nike pro",
                "tin": "123456789012"
            },
            400,
            "error",
            "Invalid email format"
    ),
    (
            {
                "email": "nazarzakrevskii@gmail.com",
                "company": "Nike pro",
                "tin": "12345678h9012"
            },
            400,
            "error",
            "Invalid TIN format"
    ),
])
def test_register_organizer_invalid_data(data, expected_status_code, expected_status_message, expected_message):
    """Регистрация с неккоректными данными"""
    response = requests.post(f"{BASE_URL}/register_organizer", json=data)
    assert response.status_code == expected_status_code, f"Unexpected status code: {response.status_code}"
    try:
        response_data = response.json()
    except ValueError:
        pytest.fail("Response is not in valid JSON format.")
    assert response_data.get(
        "status") == expected_status_message, f"Unexpected status message: {response_data.get('status')}"
    assert response_data.get("message") == expected_message, f"Unexpected message: {response_data.get('message')}"
