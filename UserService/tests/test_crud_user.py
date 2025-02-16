import pytest
import requests
from utils import *
from config import BASE_URL
import psycopg2


# ---------------------------------------------------create account-----------------------------------------------------
@pytest.mark.parametrize("data, expected_status_code, expected_message", [
    (
            {"name": create_random_string(),
             "last_name": create_random_string(),
             "email": create_random_email()},
            201,
            "User created successfully"

    )
])
def test_basic_create_user(data, expected_status_code, expected_message):
    response = requests.post(f"{BASE_URL}/user/create_account", json=data)
    assert response.status_code == expected_status_code
    assert response.json()["message"] == expected_message
    assert response.json()["data"]["role"] == "USER"


def test_create_duplicate_user():
    data = {"name": create_random_string(),
            "last_name": create_random_string(),
            "email": create_random_email()}

    response = requests.post(f"{BASE_URL}/user/create_account", json=data)
    assert response.status_code == 201

    response = requests.post(f"{BASE_URL}/user/create_account", json=data)

    assert response.status_code == 409
    assert response.json()["message"] == "User already exists"


# --------------------------------------------------update account------------------------------------------------------

def test_update_account_info():
    data = {"name": create_random_string(),
            "last_name": create_random_string(),
            "email": create_random_email()}

    response = requests.post(f"{BASE_URL}/user/create_account", json=data)
    assert response.status_code == 201
    user_id = response.json()["data"]["id"]

    data = {"name": create_random_string(),
            "last_name": create_random_string(),
            "email": create_random_email(),
            "phone_number": create_random_phone(),
            "birthday": create_random_birth_date()}

    response = requests.put(f"{BASE_URL}/user/{user_id}/update_account", json=data)
    assert response.status_code == 200
    assert response.json()["message"] == "User info updated successfully"


@pytest.mark.parametrize("data, expected_status_code, expected_message", [
    (
            {"name": create_random_string(),
             "last_name": create_random_string(),
             "email": "invalid_email",
             "phone_number": create_random_phone(),
             "birthday": create_random_birth_date()},
            400,
            "Invalid email format"
    ),
    (
            {"name": create_random_string(),
             "last_name": create_random_string(),
             "email": create_random_email(),
             "phone_number": "invalid_phone",
             "birthday": create_random_birth_date()},
            400,
            "Invalid phone number"
    )
])
def test_update_account_corner_cases(data, expected_status_code, expected_message):
    register_data = {"name": create_random_string(),
                     "last_name": create_random_string(),
                     "email": create_random_email()}
    response = requests.post(f"{BASE_URL}/user/create_account", json=data)

    user_id = response.json()["data"]["id"]

    response = requests.put(f"{BASE_URL}/user/{user_id}/update_account", json=data)

    assert response.status_code == expected_status_code
    assert response.json()["message"] == expected_message


def test_update_unregistered_user():
    data = {"name": create_random_string(),
            "last_name": create_random_string(),
            "email": create_random_email(),
            "phone_number": create_random_phone(),
            "birthday": create_random_birth_date()}

    response = requests.put(f"{BASE_URL}/user/123/update_account", json=data)
    assert response.status_code == 404
    assert response.json()["message"] == "User not found"


# --------------------------------------------------get account info----------------------------------------------------

def test_get_account_info():
    data = {"name": create_random_string(),
            "last_name": create_random_string(),
            "email": create_random_email()}

    response = requests.post(f"{BASE_URL}/user/create_account", json=data)
    assert response.status_code == 201
    user_id = response.json()["data"]["id"]

    response = requests.get(f"{BASE_URL}/user/{user_id}/account_info")
    assert response.status_code == 200
    assert response.json()["data"]["name"] == data["name"]
    assert response.json()["data"]["last_name"] == data["last_name"]
    assert response.json()["data"]["email"] == data["email"]
    assert response.json()["data"]["phone"] == "XXXXXXXXXX"
    assert response.json()["data"]["birthday"] == "01.01.2000"


def test_updated_account_info():
    data = {"name": create_random_string(),
            "last_name": create_random_string(),
            "email": create_random_email()}
    response = requests.post(f"{BASE_URL}/user/create_account", json=data)
    assert response.status_code == 201

    user_id = response.json()["data"]["id"]

    update_data = {"name": create_random_string(),
                   "last_name": create_random_string(),
                   "email": create_random_email(),
                   "phone_number": create_random_phone(),
                   "birthday": create_random_birth_date()}
    response = requests.put(f"{BASE_URL}/user/{user_id}/update_account", json=update_data)
    assert response.status_code == 200

    response = requests.get(f"{BASE_URL}/user/{user_id}/account_info")
    assert response.status_code == 200
    assert response.json()["data"]["name"] == update_data["name"]
    assert response.json()["data"]["last_name"] == update_data["last_name"]
    assert response.json()["data"]["email"] == update_data["email"]
    assert response.json()["data"]["phone"] == update_data["phone_number"]
    assert response.json()["data"]["birthday"] == update_data["birthday"]


def test_get_unregistered_user():
    response = requests.get(f"{BASE_URL}/user/123/account_info")
    assert response.status_code == 404
    assert response.json()["message"] == "User not found"