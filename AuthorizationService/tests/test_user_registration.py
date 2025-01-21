import pytest
import requests
import sqlite3
import psycopg2
from requests.exceptions import RequestException
from psycopg2.extras import RealDictCursor
from config import BASE_URL, DATABASE_CONFIG

@pytest.fixture(scope="module", autouse=True)
def check_server_availability():
    """Ensure the server is running before executing tests."""
    try:
        response = requests.get(f"{BASE_URL}/is_working")
        assert response.status_code == 200
    except RequestException:
        pytest.fail("Невозможно подключиться к серверу. Возможно он не работает")


@pytest.mark.parametrize('data, expected_status_code, expected_status_message', [
    # тест на пустые поля
    (
            {"name": "Nazar", "last_name": "", "email": "nazarzakrevski@gmail.com"},
            400,  # status code
            "fill every field!"  # response
    ),
    # корректный тест
    (
            {"name": "Nazar", "last_name": "Zakrevski", "email": "nazarzakrevski@gmail.com"},
            200,  # status code
            "User registered"  # response
    ),
    # тест на не валидность email
    (
            {"name": "Nazar", "last_name": "Zakrevski", "email": "invalid_email"},
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


@pytest.mark.parametrize('data, expected_status_code, expected_status_message', [
    # тест на пустые поля
    (
            {"name": "Nazar", "last_name": "", "email": "nazarzakrevski@gmail.com"},
            400,  # status code
            "fill every field!"  # response
    ),
    (
            {"name": "", "last_name": "", "email": ""},
            400,  # status code
            "fill every field!"  # response
    ),
    # корректный тест
    (
            {"name": "Mark", "last_name": "Dergilev", "email": "markdergilev@gmail.com"},
            200,  # status code
            "User registered"  # response
    ),
    # тест на не валидность email
    (
            {"name": "Mark", "last_name": "Dergilev", "email": "markdergilev@gmail.com"},
            400,  # status code
            "email already exists or email invalid"  # response
    ),
    # слишком длинные входные данные
    (
            {"name": "Mark" * 100, "last_name": "Dergilev" * 100, "email": "bebra@gmail.com"},
            400,  # status code
            "too long fields!"  # response
    ),
])
def test_register_duplicate_user(data, expected_status_code, expected_status_message):
    response = requests.post(f"{BASE_URL}/register_user", json=data)
    assert response.status_code == expected_status_code
    response_data = response.json()
    assert response_data["status"] == expected_status_message
    if response.status_code == 200:
        assert response_data["name"] == "Mark"
        assert response_data["last_name"] == "Dergilev"
        assert response_data["email"] == "markdergilev@gmail.com"


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


@pytest.mark.parametrize('data, expected_status_code, expected_status_message', [
    ({"name": "Nazar", "last_name": "", "email": "nazarzakrevski123@gmail.com"}, 400, "fill every field!"),
    ({"name": "Nazar", "last_name": "Zakrevski", "email": "nazarzakrevski1235@gmail.com"}, 200, "User registered"),
    ({"name": "Nazar", "last_name": "Zakrevski", "email": "invalid_email"}, 400, "email already exists or email invalid"),
])
def test_proper_database_work(data, expected_status_code, expected_status_message, db_connection):
    response = requests.post(f"{BASE_URL}/register_user", json=data)
    assert response.status_code == expected_status_code
    response_data = response.json()
    assert response_data["status"] == expected_status_message

    cursor = db_connection.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM AuthorizationService.AuthorizationData WHERE email = %s", (data["email"],))
    db_result = cursor.fetchone()

    if expected_status_code == 200:
        assert db_result is not None, "User should be present in the database"
        assert db_result["email"] == data["email"]
        assert db_result["login"] is not None
        assert db_result["password"] is not None
    else:
        assert db_result is None, "User should not be present in the database for invalid inputs"