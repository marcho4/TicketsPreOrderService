import uuid

import pytest
import requests
from requests.exceptions import RequestException
from config import BASE_URL


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
            "email": "nazarzakrevskiiOrganizer@gmail.com",
            "company": "Nike pro",
            "tin": "123456789012",
            "status": "APPROVED",
            "user_id": "13222424"
        },
        200,
        "success",
    ),
    (
        {
            "email": "organizer_email@gmail.com",
            "company": "Nike pro",
            "tin": "123456789012",
            "status": "REJECTED",
            "user_id": "13222424"
        },
        403,
        "Registration denied"
    )
])
def test_valid_register_organizer(data, expected_status_code, expected_status_message):
    """Регистрация организатора с корректными данными."""
    response = requests.post(f"{BASE_URL}/organizer/approve", json=data)
    assert response.status_code == expected_status_code, f"Unexpected status code: {response.status_code}"