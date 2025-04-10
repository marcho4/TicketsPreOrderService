import pytest
import requests
from config import BASE_URL
from config import DATABASE_CONFIG
import psycopg2
from psycopg2.extras import RealDictCursor


@pytest.fixture(scope="module")
def db_connection():
    conn = psycopg2.connect(
        dbname=DATABASE_CONFIG["dbname"],
        host=DATABASE_CONFIG["host"],
        port=DATABASE_CONFIG["port"],
    )
    yield conn
    conn.close()


@pytest.mark.parametrize("provider_data, expected_status_code", [
    (
            {
                "provider_name": "Paypal",
                "provider_description": "Paypal payment gateway"
            },
            201
    ),
    (
            {
                "provider_name": "Stripe",
                "provider_description": "Stripe payment gateway"
            },
            201
    )
])
def test_add_provider(db_connection, provider_data, expected_status_code):
    response = requests.post(f"{BASE_URL}/payments/provider/add", json=provider_data)

    assert response.status_code == expected_status_code

    cursor = db_connection.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM PaymentsSchema.Providers")
    providers_size = cursor.fetchall()

    if provider_data["provider_name"] == "Stripe":
        assert len(providers_size) == 2


def test_add_duplicate_provider(db_connection):
    provider_data = {
        "provider_name": "UMoney",
        "provider_description": "UMoney payment gateway"
    }

    response = requests.post(f"{BASE_URL}/payments/provider/add", json=provider_data)
    assert response.status_code == 201

    cursor = db_connection.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM PaymentsSchema.Providers")
    providers_before = cursor.fetchall()

    response = requests.post(f"{BASE_URL}/payments/provider/add", json=provider_data)
    assert response.status_code == 400

    cursor.execute("SELECT * FROM PaymentsSchema.Providers")
    providers_after = cursor.fetchall()

    assert len(providers_before) == len(providers_after)
