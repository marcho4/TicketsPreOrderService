import uuid
from utils import *
import pytest
import requests
from config import BASE_URL, DATABASE_CONFIG
import sqlite3
import psycopg2
from psycopg2.extras import RealDictCursor


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


def create_organizer_info(data):
    organizer_id = uuid.uuid4()
    result = requests.post(f"{BASE_URL}/create_organizer_info/{organizer_id}", json=data)
    assert result.status_code == 201
    return result


@pytest.mark.parametrize("data, new_data, expected_status_code, expected_message", [
    (
            # данные для регистрации
            {"organization_name": generate_random_organization(),
             "tin": "012345678912",
             "email": generate_random_email(),
             "phone_number": generate_random_phone_number()},

            # данные для обновления
            {"organization_name": generate_random_organization(),
             "tin": "012345678912",
             "email": generate_random_email(),
             "phone_number": generate_random_phone_number()},

            201,  # код ответа
            "User info updated successfully."  # ответ
    ),
    # невалидный телефон
    (
            {"organization_name": generate_random_organization(),
             "tin": "012345678912",
             "email": generate_random_email(),
             "phone_number": generate_random_phone_number()},

            {"organization_name": generate_random_organization(),
             "tin": "012345678912",
             "email": generate_random_email(),
             "phone_number": "824342"},

            400,  # status code
            "Invalid phone number"  # response
    ),
    # пустой email
    (
            {"organization_name": generate_random_organization(),
             "tin": "012345678912",
             "email": generate_random_email(),
             "phone_number": generate_random_phone_number()},

            {"organization_name": generate_random_organization(),
             "tin": "012345678912",
             "email": "",
             "phone_number": generate_random_phone_number()},

            400,  # status code
            "Empty fields"  # response
    )
])
def test_update_account(data, new_data, expected_status_code, expected_message, db_connection):
    data = create_organizer_info(data)
    data_json = data.json()

    # зафиксируем изначальные данные
    organizer_id = data_json["organizer_id"]
    cursor = db_connection.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM Organizers.OrganizersData WHERE email = %s", (new_data["email"],))
    db_result = cursor.fetchone()
    cursor.close()

    result = requests.put(f"{BASE_URL}/update_organizer_info/{organizer_id}", json=new_data)
    assert result.status_code == expected_status_code
    result_json = result.json()
    assert result_json["message"] == expected_message

    # проверим что данные изменились
    cursor = db_connection.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM Organizers.OrganizersData WHERE email = %s", (new_data["email"],))
    new_db_result = cursor.fetchone()

    if expected_status_code == 201:
        assert new_db_result
        assert new_db_result["organization_name"] == new_data["organization_name"]
        assert new_db_result["tin"] == new_data["tin"]
        assert new_db_result["email"] == new_data["email"]
        assert new_db_result["phone_number"] == new_data["phone_number"]
    else:
        assert db_result == new_db_result

    cursor.close()
