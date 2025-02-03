import pytest
import requests
import sqlite3
import psycopg2
from requests.exceptions import RequestException
from psycopg2.extras import RealDictCursor

from utils import *


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
            {"name": "Nazar", "last_name": "", "email": "nazarzakrevski@gmail.com", "password": "123",
             "login": "nazar", "user_id": generate_random_tin()},
            400,  # status code
            "fill every field!"  # response
    ),
    # корректный тест
    (
            {"name": "Nazar", "last_name": "Zakrevski", "email": "nazarzakrevski@gmail.com", "password": "123",
             "login": "nazar123", "user_id": generate_random_tin()},
            200,  # status code
            "User registered"  # response
    ),
    # тест на не валидность email
    (
            {"name": "Nazar", "last_name": "Zakrevski", "email": "invalid_email", "password": "123",
             "login": "nazar1234", "user_id": generate_random_tin()},
            400,  # status code
            "Email already exists or email invalid"  # response
    )
])
def test_register_user(data, expected_status_code, expected_status_message):
    response = requests.post(f"{BASE_URL}/user/register", json=data)
    assert response.status_code == expected_status_code
    response_data = response.json()
    assert response_data["message"] == expected_status_message
    if response.status_code == 200:
        assert response_data["name"] == "Nazar"
        assert response_data["last_name"] == "Zakrevski"
        assert response_data["email"] == "nazarzakrevski@gmail.com"


@pytest.mark.parametrize('data, expected_status_code, expected_status_message', [
    # тест на пустые поля
    (
            {"name": "Nazar", "last_name": "", "email": generate_random_valid_email(),
             "password": generate_random_password(), "login": generate_random_login(), "user_id": generate_random_tin()},
            400,  # status code
            "fill every field!"  # response
    ),
    (
            {"name": "", "last_name": "", "email": "", "password": generate_random_password(),
             "login": generate_random_login(), "user_id": 2},
            400,  # status code
            "fill every field!"  # response
    ),
    # корректный тест
    (
            {"name": "Mark", "last_name": "Dergilev", "email": generate_random_valid_email(),
             "password": generate_random_password(), "login": generate_random_login(), "user_id": generate_random_tin()},
            200,  # status code
            "User registered"  # response
    ),
    # тест на не валидность email
    (
            {"name": "Mark", "last_name": "Dergilev", "email": "invalid_email",
             "password": generate_random_password(), "login": generate_random_login(), "user_id": generate_random_tin()},
            400,  # status code
            "Email already exists or email invalid"  # response
    ),
    # слишком длинные входные данные
    (
            {"name": "Mark" * 100, "last_name": "Dergilev" * 100, "email": generate_random_valid_email(),
             "password": generate_random_password(), "login": generate_random_login(), "user_id": generate_random_tin()},
            400,  # status code
            "Too long fields"  # response
    ),
])
def test_register_duplicate_user(data, expected_status_code, expected_status_message):
    response = requests.post(f"{BASE_URL}/user/register", json=data)
    assert response.status_code == expected_status_code
    response_data = response.json()
    assert response_data["message"] == expected_status_message


@pytest.fixture(scope="module")
def db_connection():
    """Подключение к базе данных перед выполнением тестов."""
    conn = psycopg2.connect(
        dbname=DATABASE_CONFIG["dbname"],
        host=DATABASE_CONFIG["host"],
        port=DATABASE_CONFIG["port"],
        user=DATABASE_CONFIG["user"],
        password=DATABASE_CONFIG["password"]
    )
    yield conn
    conn.close()


@pytest.mark.parametrize('data, expected_status_code, expected_status_message', [
    # тест на пустые поля
    (
            {"name": "Nazar", "last_name": "", "email": generate_random_valid_email(),
             "login": generate_random_login(), "password": generate_random_password(), "user_id": generate_random_tin()},
            400,  # status code
            "fill every field!"  # response
    ),
    # корректный тест
    (
            {"name": "Nazar", "last_name": "Zakrevski", "email": generate_random_valid_email(),
             "login": generate_random_login(), "password": generate_random_password(), "user_id": generate_random_tin()},
            200,  # status code
            "User registered"  # response
    ),
    # тест на не валидность email
    (
            {"name": "Nazar", "last_name": "Zakrevski", "email": "invalid_email",
             "login": generate_random_login(), "password": generate_random_password(), "user_id": generate_random_tin()},
            400,  # status code
            "Email already exists or email invalid"  # response
    ),
])
def test_proper_database_work(data, expected_status_code, expected_status_message, db_connection):
    response = requests.post(f"{BASE_URL}/user/register", json=data)
    assert response.status_code == expected_status_code
    response_data = response.json()
    assert response_data["message"] == expected_status_message

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