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
    )
    yield conn
    conn.close()


@pytest.mark.parametrize(
    "name, last_name, email",
    [
        ("Nazar", "Zakrevski", generate_random_valid_email()),
        ("Denis", "Pavlukhin", generate_random_valid_email()),
        ("Mark", "Dergilev", generate_random_valid_email())
    ]
)
def test_authorize_user(db_connection, name, last_name, email):
    # первоначально зарегистрируем юзера
    register_json = register_user_premature(name, last_name, email)

    # далее получим данные пользователя из базы данных
    cursor = db_connection.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM AuthorizationService.AuthorizationData WHERE email = %s", (email,))
    db_result = cursor.fetchone()

    assert db_result, "User data not found in the database"
    login = db_result["login"]
    user_id = str(db_result["id"])

    # сделаем пробный запрос на авторизацию пользователя
    auth_response = requests.post(f"{BASE_URL}/authorize", json={
        "login": login,
        "password": register_json["password"]  # предположим, пароль возвращается при регистрации
    })
    auth_json = auth_response.json()

    assert auth_response.status_code == 200, f"Unexpected status code: {auth_response.status_code}"
    assert auth_json["msg"] == "Success"
    assert auth_json["data"]["id"] == user_id
    assert auth_json["data"]["role"] in ["ADMIN", "ORGANIZER", "USER"], "Unexpected role"

    cursor.close()


@pytest.mark.parametrize(
    "email, company, tin",
    [
        (generate_random_valid_email(), "NIKE-PRO", generate_random_tin()),
        (generate_random_valid_email(), "BEBRA-BANK", generate_random_tin()),
        (generate_random_valid_email(), "KFC-BOSS", generate_random_tin())
    ]
)
def test_authorize_organizer(db_connection, email, company, tin):
    # первоначально зарегистрируем организатора
    register_json = register_organizer_premature(email, company, tin)

    # далее получим данные пользователя из базы данных
    cursor = db_connection.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM AuthorizationService.AuthorizationData WHERE email = %s", (email,))
    db_result = cursor.fetchone()

    assert db_result, "User data not found in the database"
    login = db_result["login"]
    user_id = str(db_result["id"])

    # сделаем пробный запрос на авторизацию пользователя
    auth_response = requests.post(f"{BASE_URL}/authorize", json={
        "login": login,
        "password": register_json["password"]  # предположим, пароль возвращается при регистрации
    })
    auth_json = auth_response.json()

    assert auth_response.status_code == 200, f"Unexpected status code: {auth_response.status_code}"
    assert auth_json["msg"] == "Success"
    assert auth_json["data"]["id"] == user_id
    assert auth_json["data"]["role"] in ["ADMIN", "ORGANIZER", "USER"], "Unexpected role"

    cursor.close()