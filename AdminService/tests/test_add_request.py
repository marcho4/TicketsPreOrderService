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


def generate_random_valid_email():
    s = "abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    email = "".join(random.choices(s, k=10)) + "@gmail.com"
    return email


@pytest.mark.parametrize('data, expected_status_code, expected_status_message, expected_message', [
    (
            {"email": generate_random_valid_email(), "company": "Nike pro", "tin": "123456789012"},
            200, "success", "Organizer request added"
    ),
    (
            {"email": generate_random_valid_email(), "company": "KFC_BOSS", "tin": "12345678h9012" },
            200, "success", "Organizer request added"
    ),
])
def test_add_valid_organizer(data, expected_status_code, expected_status_message, expected_message, db_connection):

    cursor = db_connection.cursor(cursor_factory=RealDictCursor)
    # изначально при запросе в бд должно быть пусто
    cursor.execute("SELECT * FROM Organizers.OrganizerRequests WHERE email = %s", (data["email"],))
    db_result = cursor.fetchone()
    assert db_result is None

    response = requests.post(f"{BASE_URL}/add_organizer_request", json=data)
    response_body = response.json()

    # после выполнения успешного запроса в бд должна появиться запись
    cursor.execute("SELECT * FROM Organizers.OrganizerRequests WHERE email = %s", (data["email"],))
    db_result = cursor.fetchone()
    assert db_result is not None

    assert response.status_code == expected_status_code, f"Mistake: {response.status_code} :("
    assert response_body["status"] == expected_status_message, f"Mistake: {response_body['status']} :("
    assert response_body["message"] == expected_message, f"Mistake: {response_body['message']} :("


@pytest.mark.parametrize('data, expected_status_code, expected_status_message, expected_message', [
    (
            {"email": "duplicate_email@gmail.com", "company": "NikePro", "tin": "123456789012"},
            200, "success", "Organizer request added"
    ),
    (
            {"email": "duplicate_email@gmail.com", "company": "KFC_BOSS_invalid", "tin": "12345678h9012" },
            400, "error", "Organizer with this email already exists"
    ),
])
def test_add_duplicate_organizer(data, expected_status_code, expected_status_message, expected_message, db_connection):
    cursor = db_connection.cursor(cursor_factory=RealDictCursor)
    # изначально при запросе в бд должно быть пусто
    cursor.execute("SELECT * FROM Organizers.OrganizerRequests WHERE email = %s", (data["email"],))
    db_result = cursor.fetchone()

    if data["company"] == "NikePro":
        assert db_result is None
    else:
        assert db_result is not None

    response = requests.post(f"{BASE_URL}/add_organizer_request", json=data)
    response_body = response.json()

    cursor = db_connection.cursor(cursor_factory=RealDictCursor)
    # изначально при запросе в бд должно быть пусто
    cursor.execute("SELECT * FROM Organizers.OrganizerRequests WHERE company = %s", (data["company"],))
    db_result = cursor.fetchone()

    if data["company"] == "NikePro":
        assert db_result is not None
    else:
        # данные не должны были вставиться так как email уже существует
        assert db_result is None

    assert response.status_code == expected_status_code, f"Mistake: {response.status_code} :("
    assert response_body["status"] == expected_status_message, f"Mistake: {response_body['status']} :("
    assert response_body["message"] == expected_message, f"Mistake: {response_body['message']} :("