import pytest
import requests
from config import BASE_URL
from test_tickets_creating import load_tickets


@pytest.mark.parametrize("ticket, match_id, expected_status_code", [
    (
            load_tickets(),
            "df5f7d67-8ada-4840-8cbc-3914b21206dc",
            200
    ),
    (
            load_tickets(),
            "df5f7d67-8ada-2342-8cbc-3914b21206dc",
            200
    )
])
def test_get_tickets(ticket, match_id, expected_status_code):
    response = requests.get(f"{BASE_URL}/ticket/{match_id}/add", json=ticket)
    assert response.status_code == 201

    file_rows = len(ticket)
    invalid_rows = response.json()["invalid_rows"]
    expected_size = file_rows - invalid_rows

    response = requests.get(f"{BASE_URL}/ticket/{match_id}/get")
    assert response.status_code == expected_status_code
    assert len(response.json()) == expected_size
