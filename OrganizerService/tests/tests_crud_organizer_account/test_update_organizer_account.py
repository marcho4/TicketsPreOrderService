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
            "Invalid email format"  # response
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


@pytest.mark.parametrize("data", [
    {"organization_name": generate_random_organization(),
     "tin": "012345678912",
     "email": generate_random_email(),
     "phone_number": generate_random_phone_number()}
])
def test_no_changes_on_identical_data(data, db_connection):
    response = create_organizer_info(data)
    organizer_id = response.json()["organizer_id"]

    result = requests.put(f"{BASE_URL}/update_organizer_info/{organizer_id}", json=data)
    assert result.status_code == 201
    result_json = result.json()
    assert result_json["message"] == "User info updated successfully."

    cursor = db_connection.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM Organizers.OrganizersData WHERE organizer_id = %s", (organizer_id,))
    db_result = cursor.fetchone()

    assert db_result is not None
    assert db_result["organization_name"] == data["organization_name"]
    assert db_result["tin"] == data["tin"]
    assert db_result["email"] == data["email"]
    assert db_result["phone_number"] == data["phone_number"]
    cursor.close()


def test_update_with_duplicate_email(db_connection):
    data1 = {"organization_name": generate_random_organization(),
             "tin": "012345678912",
             "email": generate_random_email(),
             "phone_number": generate_random_phone_number()}
    data2 = {"organization_name": generate_random_organization(),
             "tin": "987654321098",
             "email": generate_random_email(),
             "phone_number": generate_random_phone_number()}

    response1 = create_organizer_info(data1)
    response2 = create_organizer_info(data2)
    organizer_id2 = response2.json()["organizer_id"]

    new_data = data2.copy()
    new_data["email"] = data1["email"]

    result = requests.put(f"{BASE_URL}/update_organizer_info/{organizer_id2}", json=new_data)
    assert result.status_code == 409
    assert result.json()["message"] == "User with this email already exists"
