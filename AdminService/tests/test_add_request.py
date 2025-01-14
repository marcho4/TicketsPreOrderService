import pytest
import requests
import random
from config import BASE_URL


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
def test_add_valid_organizer(data, expected_status_code, expected_status_message, expected_message):
    response = requests.post(f"{BASE_URL}/add_organizer_request", json=data)
    response_body = response.json()

    assert response.status_code == expected_status_code, f"Mistake: {response.status_code} :("
    assert response_body["status"] == expected_status_message, f"Mistake: {response_body['status']} :("
    assert response_body["message"] == expected_message, f"Mistake: {response_body['message']} :("


@pytest.mark.parametrize('data, expected_status_code, expected_status_message, expected_message', [
    (
            {"email": "duplicate_email@gmail.com", "company": "Nike pro", "tin": "123456789012"},
            200, "success", "Organizer request added"
    ),
    (
            {"email": "duplicate_email@gmail.com", "company": "KFC_BOSS", "tin": "12345678h9012" },
            400, "error", "Organizer with this email already exists"
    ),
])
def test_add_duplicate_organizer(data, expected_status_code, expected_status_message, expected_message):
    response = requests.post(f"{BASE_URL}/add_organizer_request", json=data)
    response_body = response.json()

    assert response.status_code == expected_status_code, f"Mistake: {response.status_code} :("
    assert response_body["status"] == expected_status_message, f"Mistake: {response_body['status']} :("
    assert response_body["message"] == expected_message, f"Mistake: {response_body['message']} :("