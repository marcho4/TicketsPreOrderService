import pytest
import requests
import sqlite3

from requests.exceptions import RequestException
from config import BASE_URL, DATABASE_PATH


@pytest.fixture(scope="module", autouse=True)
def check_server_availability():
    """Ensure the server is running before executing tests."""
    try:
        response = requests.get(f"{BASE_URL}/is_working")
        assert response.status_code == 200
    except RequestException:
        pytest.fail("Невозможно подключиться к серверу. Возможно он не работает")

# @pytest.fixture(scope="module")
# def db_connection():
#     """Подключение к базе данных перед выполнением тестов и закрытие после"""
#     conn = sqlite3.connect(DATABASE_PATH)
#     yield conn
#     conn.close()

@pytest.mark.parametrize('data, expected_status_code, expected_status_message', [
    # тест на пустые поля
    (
            {"name": "Nazar",
             "last_name": "",
             "email": "nazarzakrevski@gmail.com"},
            400,  # status code
            "fill every field!"  # response
    ),
    # корректный тест
    (
            {"name": "Nazar",
             "last_name": "Zakrevski",
             "email": "nazarzakrevski@gmail.com"},
            200,  # status code
            "User registered"  # response
    ),
    # тест на не валидность email
    (
            {"name": "Nazar",
             "last_name": "Zakrevski",
             "email": "invalid_email"},
            400,  # status code
            "email already exists or email invalid"  # response
    ),
])
def test_register_user(data, expected_status_code, expected_status_message):
    response = requests.post(f"{BASE_URL}/register_user", json=data)
    assert response.status_code == expected_status_code
    response_data = response.json()
    assert response_data["status"] == expected_status_message
    if response.status_code == 200:
        assert response_data["name"] == "Nazar"
        assert response_data["last_name"] == "Zakrevski"
        assert response_data["email"] == "nazarzakrevski@gmail.com"


@pytest.mark.parametrize('data, expected_status_code, expected_status_message', [
    # тест на пустые поля
    (
            {"name": "Nazar",
             "last_name": "",
             "email": "nazarzakrevski@gmail.com"},
            400,  # status code
            "fill every field!"  # response
    ),
    # корректный тест
    (
            {"name": "Mark",
             "last_name": "Dergilev",
             "email": "markdergilev@gmail.com"},
            200,  # status code
            "User registered"  # response
    ),
    # тест на не валидность email
    (
            {"name": "Mark",
             "last_name": "Dergilev",
             "email": "markdergilev@gmail.com"},
            400,  # status code
            "email already exists or email invalid"  # response
    ),
])
def test_register_duplicate_user(data, expected_status_code, expected_status_message):
    response = requests.post(f"{BASE_URL}/register_user", json=data)
    assert response.status_code == expected_status_code
    response_data = response.json()
    assert response_data["status"] == expected_status_message
    if response.status_code == 200:
        assert response_data["name"] == "Mark"
        assert response_data["last_name"] == "Dergilev"
        assert response_data["email"] == "markdergilev@gmail.com"


# @pytest.mark.parametrize('data, expected_status_code, expected_status_message, should_have_been_inserted', [
#     (
#             {"name": "Nazar",
#              "last_name": "",
#              "email": "nazarzakrevski@gmail.com"},
#             400,  # status code
#             "fill every field!",  # response
#             False
#     )
#     (
#         {"name": "Nazar",
#          "last_name": "",
#          "email": "nazarzakrevski@gmail.com"},
#         200,  # status code
#         "User registered",  # response
#         True
#     )
# ])
# def test_proper_database_work(data, expected_status_code, expected_status_message, should_have_been_inserted):
#     response = requests.post(f"{BASE_URL}/register_user", json=data)
#     assert response.status_code == expected_status_code
#     response_data = response.json()
#     assert response_data["status"] == expected_status_message
#     cursor = db_connection.cursor()
#     cursor.execute("SELECT * FROM AuthorizationService.AuthorizationData WHERE email = ?", (data["email"],))
#     ans = cursor.fetchone()
#     if response.status_code == 200:
#         assert response_data["name"] == "Nazar"
#         assert response_data["last_name"] == "Zakrevski"
#         assert response_data["email"] == "nazarzakrevski@gmail.com"
#     if should_have_been_inserted:
#         assert ans is not None, "Пользователь должен существовать в базе данных"
#         assert ans[3] == "nazarzakrevski@gmail.com"
#
