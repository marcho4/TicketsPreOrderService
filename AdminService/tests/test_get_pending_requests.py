import pytest
import requests
import random
import sqlite3
import psycopg2
from config import BASE_URL
from config import DATABASE_CONFIG
from requests.exceptions import RequestException
from psycopg2.extras import RealDictCursor


@pytest.fixture(scope="module", autouse=True)
def check_server_availability():
    """Убедимся что сервер доступен и готов отвечать на запрос."""
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


def add_request(data, db_connection):
    response = requests.post(f"{BASE_URL}/admin/add_organizer_request", json=data)

    assert response.status_code == 200


def generate_random_valid_email():
    s = "abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    email = "".join(random.choices(s, k=10)) + "@gmail.com"
    return email


@pytest.mark.parametrize('data', [
    {"email": generate_random_valid_email(),
     "company": "Nike pro",
     "tin": "123456789012"}
])
def test_get_pending_requests(data, db_connection):
    add_request(data, db_connection)

    response = requests.get(f"{BASE_URL}/admin/get_pending_requests")
    response_body = response.json()

    assert response.status_code == 200
    assert response_body == [{"email": data["email"], "company": data["company"], "tin": data["tin"]}]