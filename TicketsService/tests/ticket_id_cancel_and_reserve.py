import pytest
import requests
from config import DATABASE_CONFIG
import psycopg2
import random
from config import BASE_URL
from test_tickets_creating import load_tickets


@pytest.fixture(scope="module")
def db_connection():
    conn = psycopg2.connect(
        dbname=DATABASE_CONFIG["dbname"],
        host=DATABASE_CONFIG["host"],
        port=DATABASE_CONFIG["port"]
    )
    yield conn
    conn.close()


@pytest.mark.parametrize("ticket, match_id, expected_status_code", [
    (
            load_tickets(),
            "df5f7d67-8ada-2423-8cbc-3914b21206dc",
            200
    ),
    (
            load_tickets(),
            "df5f7d67-8ada-3535-8cbc-3914b21206dc",
            200
    )
])
def test_reserve_ticket(ticket, match_id, expected_status_code):
    response = requests.post(f"{BASE_URL}/ticket/{match_id}/add", json=ticket)
    assert response.status_code == 201

    cursor = db_connection.cursor()
    cursor.execute(f"SELECT * FROM tickets WHERE match_id = '{match_id}' AND status = 'available'")
    tickets_count_before = len(cursor.fetchall())

    response = requests.get(f"{BASE_URL}/ticket/{match_id}/get")
    random_id = random.random() % len(response.json())
    ticket_id = response.json()[random_id]["id"]
    user_id = response.json()[random_id]["user_id"]

    response = requests.post(f"{BASE_URL}/ticket/{ticket_id}/reserve", json={"match_id": match_id,
                                                                             "user_id": user_id})

    cursor.execute(f"SELECT * FROM tickets WHERE match_id = '{match_id}' AND status = 'available'")
    tickets_count_after = len(cursor.fetchall())

    assert tickets_count_before - 1 == tickets_count_after
