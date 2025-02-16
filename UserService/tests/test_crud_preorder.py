import uuid

import pytest
import requests
from utils import *
from config import BASE_URL
from config import DATABASE_CONFIG
import psycopg2


@pytest.fixture(scope="module")
def db_connection():
    conn = psycopg2.connect(
        dbname=DATABASE_CONFIG["dbname"],
        host=DATABASE_CONFIG["host"],
        port=DATABASE_CONFIG["port"]
    )
    yield conn
    conn.close()


def create_user(data):
    response = requests.post(f"{BASE_URL}/user/create_account", json=data)
    assert response.status_code == 201
    return response.json()["data"]["id"]


@pytest.mark.parametrize("preorder_data, expected_status_code", [
    (
            {"match_id": "df5f7d67-8ada-4840-8cbc-3914b21206dc",
             "ticket_id": "df5f7d67-8ada-4840-8cbc-3914b21206dc",
             "match_datetime": "2026-10-10 10:00:00"},
            201
    ),
    (
            {"match_id": "df5f7d67-8ada-4840-8cbc-3914b21206dc",
             "ticket_id": "df5f7d67-8ada-4840-8cbc-3914b21206dc",
             "match_datetime": "2026-10-10 10:00:00"},
            201
    )
])
def test_add_preorder(db_connection, preorder_data, expected_status_code):
    user_id = create_user({"name": create_random_string(),
                           "last_name": create_random_string(),
                           "email": create_random_email()})

    response = requests.post(f"{BASE_URL}/user/{user_id}/add_preorder", json=preorder_data)
    assert response.status_code == expected_status_code

    if expected_status_code == 201:
        cursor = db_connection.cursor()
        cursor.execute("SELECT * FROM Users.Preorders WHERE user_id = %s", (user_id,))
        assert cursor.fetchone() is not None
        cursor.close()


def test_add_preorder_user_not_found():
    response = requests.post(f"{BASE_URL}/user/df5f7d67-8ada-4840-8cbc-3914b21206dc/add_preorder", json={})
    assert response.status_code == 404


def add_preorder(user_id, preorder_data):
    response = requests.post(f"{BASE_URL}/user/{user_id}/add_preorder", json=preorder_data)
    assert response.status_code == 201


@pytest.mark.parametrize("preorder_data, expected_status_code, database_rows", [
    (
            {"match_id": "df5f7d67-8ada-4840-8cbc-3914b21206dc",
             "ticket_id": "df5f7d67-8ada-4840-8cbc-3914b21206dc",
             "match_datetime": "2026-10-10 10:00:00"},
            200,
            1
    ),
    (
            {"match_id": "df5f7d67-8ada-4840-8cbc-3914b21206dc",
             "ticket_id": "df5f7d67-8ada-4840-8cbc-3914b21206dc",
             "match_datetime": "2026-10-10 10:00:00"},
            200,
            1
    )
])
def test_cancel_preorder(db_connection, preorder_data, expected_status_code, database_rows):
    user_id = create_user({"name": create_random_string(),
                           "last_name": create_random_string(),
                           "email": create_random_email()})
    add_preorder(user_id, preorder_data)

    cancel_preorder_json = {
        "match_id": preorder_data["match_id"],
        "ticket_id": preorder_data["ticket_id"],
    }

    cursor = db_connection.cursor()
    cursor.execute("SELECT * FROM Users.Preorders WHERE user_id = %s", (user_id,))
    assert cursor.rowcount == database_rows

    response = requests.delete(f"{BASE_URL}/user/{user_id}/cancel_preorder", json=cancel_preorder_json)
    assert response.status_code == expected_status_code

    cursor.execute("SELECT * FROM Users.Preorders WHERE user_id = %s", (user_id,))
    assert cursor.rowcount == 0


def test_cancel_preorder_user_not_found():
    cancel_preorder_json = {
        "match_id": "df5f7d67-8ada-4840-8cbc-3914b21206dc",
        "ticket_id": "df5f7d67-8ada-4840-8cbc-3914b21206dc",
    }
    response = requests.delete(f"{BASE_URL}/user/df5f7d67-8ada-4840-8cbc-3914b21206dc/cancel_preorder",
                               json=cancel_preorder_json)
    assert response.status_code == 404
    assert response.json()["message"] == "User not found"


def test_cancel_preorder_preorder_not_found():
    user_id = create_user({"name": create_random_string(),
                           "last_name": create_random_string(),
                           "email": create_random_email()})

    cancel_preorder_json = {
        "match_id": "df5f7d67-8ada-4840-8cbc-3914b21206dc",
        "ticket_id": "df5f7d67-8ada-4840-8cbc-3914b21206dc",
    }

    response = requests.delete(f"{BASE_URL}/user/{user_id}/cancel_preorder", json=cancel_preorder_json)
    assert response.status_code == 404
    assert response.json()["message"] == "Preorder not found"


def create_random_uuid():
    return str(uuid.uuid4())


def test_get_preorders(db_connection):
    user_id = create_user({"name": create_random_string(),
                           "last_name": create_random_string(),
                           "email": create_random_email()})
    cursor = db_connection.cursor()
    for i in range(0, 5):
        preorder_data = {"match_id": create_random_uuid(),
                         "ticket_id": create_random_uuid(),
                         "match_datetime": "2026-10-10 10:00:00"}

        cursor.execute("SELECT * FROM Users.Preorders WHERE match_id = %s AND ticket_id = %s",
                       (preorder_data["match_id"], preorder_data["ticket_id"]))
        assert cursor.fetchone is not None

        add_preorder(user_id, preorder_data)

    response = requests.get(f"{BASE_URL}/user/{user_id}/preorders")
    assert response.status_code == 200
    assert len(response.json()) == 5


def test_get_finished_preorders(db_connection):
    user_id = create_user({"name": create_random_string(),
                           "last_name": create_random_string(),
                           "email": create_random_email()})
    cursor = db_connection.cursor()
    preorder_data = {"match_id": create_random_uuid(),
                     "ticket_id": create_random_uuid(),
                     "match_datetime": "2021-10-10 10:00:00"}
    add_preorder(user_id, preorder_data)

    cursor.execute("SELECT * FROM Users.Preorders WHERE match_id = %s AND ticket_id = %s",
                   (preorder_data["match_id"], preorder_data["ticket_id"]))
    assert cursor.fetchone is not None

    response = requests.get(f"{BASE_URL}/user/{user_id}/preorders")
    assert response.status_code == 200
    assert len(response.json()) == 0


def test_get_events(db_connection):
    user_id = create_user({"name": create_random_string(),
                           "last_name": create_random_string(),
                           "email": create_random_email()})

    cursor = db_connection.cursor()
    for i in range(0, 5):
        preorder_data = {"match_id": create_random_uuid(),
                         "ticket_id": create_random_uuid(),
                         "match_datetime": "2021-10-10 10:00:00"}
        add_preorder(user_id, preorder_data)

        cursor.execute("SELECT * FROM Users.AttendedEvents WHERE user_id = %s", (user_id,))
        assert cursor.rowcount == i + 1

    response = requests.get(f"{BASE_URL}/user/{user_id}/events_history")
    assert response.status_code == 200
    assert len(response.json()) == 5
