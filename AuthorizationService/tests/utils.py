import random
import requests
from config import BASE_URL, DATABASE_CONFIG
def generate_random_valid_email():
    s = "abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    email = "".join(random.choices(s, k=10)) + "@gmail.com"
    return email

def generate_random_tin():
    s = "01234567890123"
    tin = "".join(random.choices(s, k=12))
    return tin


def register_user_premature(name, last_name, email):
    # mock данные для регистрации
    register_data = {
        "name": name,
        "last_name": last_name,
        "email": email
    }

    # для начала зарегистрируем пользователя
    register_response = requests.post(f"{BASE_URL}/register_user", json=register_data)
    register_json = register_response.json()

    assert register_response.status_code == 200, f"Unexpected status code: {register_response.status_code}"
    assert register_json["status"] == "User registered", f"Unexpected status: {register_json['status']}"
    assert register_json["name"] == name, f"Unexpected name: {register_json['name']}"
    assert register_json["last_name"] == last_name, f"Unexpected last name: {register_json['last_name']}"
    assert register_json["email"] == email, f"Unexpected email: {register_json['email']}"

    return register_json


def register_organizer_premature(email, company, tin):
    register_data = {
        "email": email,
        "company": company,
        "tin": tin
    }

    register_response = requests.post(f"{BASE_URL}/register_organizer", json=register_data)
    register_json = register_response.json()

    assert register_response.status_code == 200, f"Unexpected status code: {register_response.status_code}"
    assert register_json["status"] == "Application sent to admin", f"Unexpected status: {register_json['status']}"
    assert register_json["login"] is not None, register_json["password"] is not None

    return register_json



