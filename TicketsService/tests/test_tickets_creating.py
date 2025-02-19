import pytest
import requests
import csv
from config import BASE_URL


def load_tickets():
    tickets = []
    with open('tickets.csv', mode='r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            tickets.append(row)
    return tickets


@pytest.mark.parametrize("ticket, match_id, expected_status_code", [
    (
        load_tickets(),
        "df5f7d67-8ada-4840-8cbc-3914b21206dc",
        201
    ),
    (
        load_tickets(),
        "df5f7d67-8ada-2342-8cbc-3914b21206dc",
        201
    )
])
def test_add_tickets(ticket, match_id):
    response = requests.post(f"{BASE_URL}/ticket/{match_id}/add", json=ticket)
    assert response.status_code == 201
