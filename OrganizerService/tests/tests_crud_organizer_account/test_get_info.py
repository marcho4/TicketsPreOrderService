import uuid
from OrganizerService.tests.utils import *
import pytest
import requests
from OrganizerService.tests.config import BASE_URL, DATABASE_CONFIG
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


@pytest.mark.parametrize("data, expected_status_code, expected_message", [
    (
            {"organization_name": generate_random_organization(),
             "tin": "012345678912",
             "email": generate_random_email(),
             "phone_number": generate_random_phone_number()},
            200,
            ""
    ),
    (
            {"organization_name": generate_random_organization(),
             "tin": "012345678912",
             "email": generate_random_email(),
             "phone_number": generate_random_phone_number()},
            400,
            "Invalid organizer_id format"
    )
])
def test_get_account_data(data, expected_status_code, expected_message, db_connection):
    response = create_organizer_info(data)
    response_json = response.json()

    organizer_id = response_json["data"]["id"]
    cursor = db_connection.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM Organizers.OrganizersData WHERE email = %s", (data["email"],))
    db_result = cursor.fetchone()
    cursor.close()

    if expected_status_code == 200:
        result = requests.get(f"{BASE_URL}/get_account_info/{organizer_id}/", json=data)
        print(organizer_id)
        assert result.status_code == expected_status_code
        result_json = result.json()
        assert result_json["organization_name"] == data["organization_name"]
        assert result_json["tin"] == data["tin"]
        assert result_json["email"] == data["email"]
        assert result_json["phone_number"] == data["phone_number"]
    else:
        organizer_id = uuid.uuid4()
        result = requests.get(f"{BASE_URL}/get_account_info/unknown_id", json=data)
        assert result.status_code == expected_status_code
        result_json = result.json()
        assert result_json["message"] == expected_message
