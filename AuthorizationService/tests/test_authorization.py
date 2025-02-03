import pytest
import requests
import sqlite3
import psycopg2
from requests.exceptions import RequestException
from psycopg2.extras import RealDictCursor
from config import BASE_URL, DATABASE_CONFIG
from utils import *


@pytest.fixture(scope="module", autouse=True)
def check_server_availability():
    """Ensure the server is running before executing tests."""
    try:
        response = requests.get(f"{BASE_URL}/is_working")
        assert response.status_code == 200
    except RequestException:
        pytest.fail("Невозможно подключиться к серверу. Возможно он не работает")


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


@pytest.mark.parametrize(
    "name, last_name, email, login, password, user_id",
    [
        ("Nazar", "Zakrevski", generate_random_valid_email(), generate_random_login(), generate_random_password(),
         generate_random_login()),
        ("Denis", "Pavlukhin", generate_random_valid_email(), generate_random_login(), generate_random_password(),
         generate_random_login()),
        ("Mark", "Dergilev", generate_random_valid_email(), generate_random_login(), generate_random_password(),
         generate_random_login())
    ]
)
def test_authorize_user(db_connection, name, last_name, email, login, password, user_id):
    # первоначально зарегистрируем юзера
    register_json = register_user_premature(name, last_name, email, password, login, user_id)

    # далее получим данные пользователя из базы данных
    cursor = db_connection.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM AuthorizationService.AuthorizationData WHERE email = %s", (email,))
    db_result = cursor.fetchone()

    assert db_result, "User data not found in the database"
    user_id = str(db_result["user_id"])

    # сделаем пробный запрос на авторизацию пользователя
    auth_response = requests.post(f"{BASE_URL}/authorize", json={
        "login": login,
        "password": password
    })
    auth_json = auth_response.json()

    assert auth_response.status_code == 200, f"Unexpected status code: {auth_response.status_code}"
    assert auth_json["msg"] == "Success"
    assert auth_json["data"]["user_id"] == user_id
    assert auth_json["data"]["role"] in ["ADMIN", "ORGANIZER", "USER"], "Unexpected role"

    cursor.close()


@pytest.mark.parametrize(
    "name, last_name, email, login, password, user_id",
    [
        ("Tim", "Bulgakov", generate_random_valid_email(), generate_random_login(), generate_random_password(),
         generate_random_login()),
        ("Alex", "Dergilev", generate_random_valid_email(), generate_random_login(), generate_random_password(),
         generate_random_login())
    ]
)
def test_invalid_authorize_user(name, last_name, email, login, password, user_id):
    register_json = register_user_premature(name, last_name, email, password, login, user_id)

    # сделаем пробный запрос на авторизацию пользователя
    auth_response = requests.post(f"{BASE_URL}/authorize", json={
        "login": "invalid_login",
        "password": "invalid_password"  # предположим, пароль возвращается при регистрации
    })
    auth_json = auth_response.json()
    assert auth_response.status_code == 403  # forbidden
