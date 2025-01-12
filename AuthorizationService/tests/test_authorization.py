import pytest
import requests
import random
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


def generate_random_valid_email():
    s = "abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    email = "".join(random.sample(s, 10)) + "@gmail.com"
    return email


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
    # mock данные
    register_data = {
        "name": name,
        "last_name": last_name,
        "email": email
    }
    # зарегистрировали пользователя
    response = requests.post(f"{BASE_URL}/register_user", json=register_data)

    response_json = response.json()
    assert response.status_code == 200
    assert response_json["status"] == "User registered"
    assert response_json["name"] == name
    assert response_json["last_name"] == last_name
    assert response_json["email"] == email

    # теперь он попробует авторизоваться, но для начала получим его данные из базы
    cursor = db_connection.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM AuthorizationService.AuthorizationData WHERE email = %s", (register_data["email"],))
    db_result = cursor.fetchone()

    login = db_result["login"] # логин пользователя
    password = response_json["password"] # пароль пользователя
    user_id = db_result["id"]

    response = requests.post(f"{BASE_URL}/authorize/{user_id}", json={"login": login, "password": password})
    assert response.status_code == 200
    response_json = response.json()
    assert response_json["status"] == "Access allowed"



