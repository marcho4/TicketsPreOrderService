import pytest
import requests
from utils import generate_random_valid_email, generate_random_password, generate_random_tin, register_user_premature
from config import BASE_URL


def authorize_user(login, password):
    response = requests.post(f"{BASE_URL}/authorize", json={"login": login, "password": password})
    return response


@pytest.mark.parametrize(
    "name, last_name, email, password, login, user_id, new_password, authorize_code_left, authorize_code_mid, authorize_code_right",
    [
        (
                "Nazar",
                "Zakrevski",
                generate_random_valid_email(),
                generate_random_password(),
                "mock_login",
                generate_random_tin(),
                "mark_dodik",
                200,  # код успешной авторизации с изначальным паролем
                403,  # ожидаем отказ в авторизации после смены пароля (старый пароль должен быть недействителен)
                200   # ожидаем успешную авторизацию с новым паролем
        ),
    ]
)
def test_change_password(name, last_name, email, password, login, user_id, new_password,
                         authorize_code_left, authorize_code_mid, authorize_code_right):
    register_user_premature(name, last_name, email, password, login, user_id)

    response = authorize_user(login, password)
    user_id = response.json()["data"]["auth_id"]

    assert response.status_code == authorize_code_left

    change_data_response = requests.put(f"{BASE_URL}/user/{user_id}/password/change", json={
        "login": login,
        "password": new_password
    })
    assert change_data_response.status_code == 200

    response = authorize_user(login, password)
    assert response.status_code == authorize_code_mid

    response = authorize_user(login, new_password)
    assert response.status_code == authorize_code_right