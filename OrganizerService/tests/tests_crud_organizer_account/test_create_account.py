import uuid

import pytest
import requests
from OrganizerService.tests.config import BASE_URL, DATABASE_CONFIG
import psycopg2


@pytest.fixture(scope="module")
def db_connection():
    """Подключение к базе данных перед выполнением тестов."""
    conn = psycopg2.connect(
        dbname=DATABASE_CONFIG["dbname"],
        host=DATABASE_CONFIG["host"],
        port=DATABASE_CONFIG["port"],
    )
    yield conn
    conn.close()


@pytest.mark.parametrize("data, expected_status_code, expected_message", [
    # для начала зарегистрируем организатора
    (
            {"organization_name": "KFC",
             "tin": "123456789012",
             "email": "nazarzakrevski@gmail.com"},
            201,  # status code
            "Organizer created successfully"  # response
    ),
    # теперь попробуем зарегистрироваться еще раз с теми же данными
    (
            {"organization_name": "KFC",
             "tin": "123456789012",
             "email": "nazarzakrevski@gmail.com"},
            409,  # status code
            "User with this email already exists"  # response
    )
])
def test_create_account(data, expected_status_code, expected_message, db_connection):
    organizer_id = uuid.uuid4()
    result = requests.post(f"{BASE_URL}/organizer/create_account", json=data, verify=False)
    assert result.status_code == expected_status_code
    result_json = result.json()
    assert result_json["message"] == expected_message


@pytest.mark.parametrize("data, expected_status_code, expected_message", [
    (
            {},
            400,  # status code
            "Missing field: email"  # response
    ),
    (
            {"organization_name": "Subway",
             "tin": "654321098765"},
            400,  # status code
            "Missing field: email"  # response
    ),
])
def test_create_account_edge_cases(data, expected_status_code, expected_message, db_connection):
    organizer_id = uuid.uuid4()
    result = requests.post(f"{BASE_URL}/organizer/create_account", json=data, verify=False)
    assert result.status_code == expected_status_code
    result_json = result.json()
    assert result_json["message"] == expected_message
