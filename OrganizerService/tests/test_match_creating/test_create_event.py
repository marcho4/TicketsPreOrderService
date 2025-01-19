import uuid
from OrganizerService.tests.utils import *
from OrganizerService.tests.config import BASE_URL, DATABASE_CONFIG
import pytest
import requests
import psycopg2


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
            # данные для регистрации организатора
            {"organization_name": generate_random_organization(),
             "tin": "012345678912",
             "email": generate_random_email(),
             "phone_number": generate_random_phone_number()},

            # данные о матче
            {"team_home": "FC Barcelona",
             "team_away": "Real Madrid",
             "match_date": "2022-12-12",
             "match_time": "12:00",
             "stadium": "Camp Nou",
             "match_description": "El Clasico"},

            201,  # код ответа
            "User info updated successfully."  # ответ
    ),
])
def test_create_valid_event(data, new_data, expected_status_code, expected_message, db_connection):
    response = create_organizer_info(data)
    data_json = data.json()
    organizer_id = data_json["organizer_id"]

    response = requests.post(f"{BASE_URL}/organizer/{organizer_id}/create_match", json=new_data)

    assert response.status_code == expected_status_code
    assert response.message == expected_message


@pytest.mark.parametrize("data, new_data, expected_status_code, expected_message", [
    (
            # данные для регистрации организатора
            {"organization_name": generate_random_organization(),
             "tin": "012345678912",
             "email": generate_random_email(),
             "phone_number": generate_random_phone_number()},

            # данные о матче
            {"team_home": "FC Barcelona",
             "team_away": "Real Madrid",
             "match_date": "2022-12-12",
             "match_time": "12:00",
             "stadium": "Camp Nou",
             "match_description": "El Clasico"},

            201,  # код ответа
            "User info updated successfully."  # ответ
    ),
])
def test_create_valid_event(data, new_data, expected_status_code, expected_message, db_connection):
    response = create_organizer_info(data)
    data_json = data.json()
    organizer_id = data_json["organizer_id"]

    response = requests.post(f"{BASE_URL}/organizer/random_id/create_match", json=new_data)

    assert response.status_code == expected_status_code
    assert response.message == expected_message