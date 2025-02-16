import pytest
import requests
from utils import *
from config import BASE_URL


def create_user(data):
    response = requests.post(f"{BASE_URL}/user/create_account", json=data)
    assert response.status_code == 201
    return response.json()["data"]["id"]


@pytest.mark.parametrize("match_id, expected_data", [
    ("df5f7d67-8ada-1234-8cbc-3914b21206dc", {"message": "user added to waiting list", "queue_length": 1}),
    ("df5f7d67-8ada-1234-8cbc-3914b21206dc", {"message": "user added to waiting list", "queue_length": 2}),
    ("df5f7d67-8ada-1234-8cbc-3914b21206dc", {"message": "user added to waiting list", "queue_length": 3}),
])
def test_add_to_waiting_list_one_event(match_id, expected_data):
    user_id = create_user({"name": create_random_string(),
                           "last_name": create_random_string(),
                           "email": create_random_email()})

    if expected_data["queue_length"] == 1:
        requests.delete(f"{BASE_URL}/redis/match_queue/{match_id}/clear")

    response = requests.post(f"{BASE_URL}/redis/user/{user_id}/waiting_list", json={"match_id": match_id})
    assert response.status_code == 200
    assert response.json()["message"] == expected_data["message"]
    assert response.json()["queue_length"] == expected_data["queue_length"]


@pytest.mark.parametrize("match_id, expected_data", [
    ("df5f7d67-8ada-4292-8cbc-3914b21206dc", {"message": "user added to waiting list", "queue_length": 1}),
    ("df5f7d67-8ada-4229-8cbc-3914b21206dc", {"message": "user added to waiting list", "queue_length": 1}),
    ("df5f7d67-8ada-8203-8cbc-3914b21206dc", {"message": "user added to waiting list", "queue_length": 1}),
])
def test_add_to_waiting_list_different_events(match_id, expected_data):
    user_id = create_user({"name": create_random_string(),
                           "last_name": create_random_string(),
                           "email": create_random_email()})

    requests.delete(f"{BASE_URL}/redis/match_queue/{match_id}/clear")
    response = requests.post(f"{BASE_URL}/redis/user/{user_id}/waiting_list", json={"match_id": match_id})
    assert response.status_code == 200
    assert response.json()["message"] == expected_data["message"]
    assert response.json()["queue_length"] == expected_data["queue_length"]