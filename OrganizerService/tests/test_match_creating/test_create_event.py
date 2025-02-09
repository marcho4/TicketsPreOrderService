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
    result = requests.post(f"{BASE_URL}/organizer/create_account", json=data, verify=False)
    assert result.status_code == 201
    return result


@pytest.mark.parametrize("data, new_data, expected_status_code, expected_message", [
    (
            # данные для регистрации организатора
            {"organization_name": generate_random_organization(),
             "tin": "012345678912",
             "email": generate_random_email()},

            # данные о матче
            {"team_home": "FC Barcelona",
             "team_away": "Real Madrid",
             "match_datetime": "2025-01-19T14:23:30.123Z",
             "stadium": "Camp Nou",
             "match_description": "El Clasico"},

            200,  # код ответа
            "Match created successfully"  # ответ
    ),
])
def test_create_valid_event(data, new_data, expected_status_code, expected_message, db_connection):
    response = create_organizer_info(data)
    data_json = response.json()
    organizer_id = data_json["data"]["id"]
    print("bebra id: ", organizer_id)
    response = requests.post(f"{BASE_URL}/organizer/{organizer_id}/create_match", json=new_data, verify=False)

    assert response.status_code == expected_status_code
    assert response.json()["message"] == expected_message


@pytest.mark.parametrize("new_data, expected_status_code, expected_message", [
    (
            # данные о матче
            {"team_home": "FC Barcelona",
             "team_away": "Real Madrid",
             "match_datetime": "2025-01-20T14:23:30.123Z",
             "stadium": "Camp Nou",
             "match_description": "El Clasico"},

            400,  # код ответа
            "Invalid organizer_id format"  # ответ
    ),
])
def test_create_event_invalid_organizer_id(new_data, expected_status_code, expected_message, db_connection):
    response = requests.post(f"{BASE_URL}/organizer/random_id/create_match", json=new_data, verify=False)
    assert response.status_code == expected_status_code
    assert response.json()["message"] == expected_message


@pytest.mark.parametrize("data, new_data, expected_status_code_1, expected_message_1, "
                         "expected_status_code_2, expected_message_2", [
    (
            # данные для регистрации организатора
            {"organization_name": generate_random_organization(),
             "tin": "012345678912",
             "email": generate_random_email()},

            # данные о матче
            {"team_home": "FC Barcelona",
             "team_away": "Real Madrid",
             "match_datetime": "2025-01-21T14:23:30.123Z",
             "stadium": "Camp Nou",
             "match_description": "El Clasico"},

            200,  # код ответа
            "Match created successfully",  # ответ
            409,
            "Organizer does not exists or match found"
    ),
])
def test_try_create_duplicate_event(data, new_data, expected_status_code_1, expected_message_1,
                                    expected_status_code_2, expected_message_2, db_connection):
    response = create_organizer_info(data)
    data_json = response.json()
    organizer_id = data_json["data"]["id"]
    response = requests.post(f"{BASE_URL}/organizer/{organizer_id}/create_match", json=new_data, verify=False)

    assert response.status_code == expected_status_code_1
    assert response.json()["message"] == expected_message_1

    response = requests.post(f"{BASE_URL}/organizer/{organizer_id}/create_match", json=new_data, verify=False)

    assert response.status_code == expected_status_code_2
    assert response.json()["message"] == expected_message_2
