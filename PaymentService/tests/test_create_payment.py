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


@pytest.mark.parametrize("payment_data, expected_status_code, expected_message", [
    (
            {
                "user_id": "03e40c24-1d2c-4480-90e7-ad58cd17192f",
                "amount": "100.00",
                "currency": "USD",
                "provider": "PayPal",
                "match_id": "03e40c24-1d2c-6784-90e7-ad58cd17192f",
                "ticket_id": "03e40c24-1d2c-9842-90e7-ad58cd17192f"
            },
            201,
            "Payment created"
    )
])
def test_create_payment(payment_data, expected_status_code, expected_message):
    response = requests.post(f"{BASE_URL}/payments/create", json=payment_data)

    assert response.status_code == expected_status_code

    json_response = response.json()
    assert json_response["message"] == expected_message


def test_create_duplicate_payment(db_connection):
    payment_data = {
        "user_id": "03e40c24-1d2c-4480-90e7-ad58cd17192f",
        "amount": "100.00",
        "currency": "USD",
        "provider": "PayPal",
        "match_id": "03e40c24-1d2c-3533-90e7-ad58cd17192f",
        "ticket_id": "03e40c24-1d2c-3213-90e7-ad58cd17192f"
    }

    response = requests.post(f"{BASE_URL}/payments/create", json=payment_data)
    assert response.status_code == 201

    cursor = db_connection.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM PaymentsSchema.Payments")
    payments_before = cursor.fetchall()

    response = requests.post(f"{BASE_URL}/payments/create", json=payment_data)
    assert response.status_code == 409
    assert response.json()["message"] == "Payment with this match_id and ticket_id already exists"

    cursor.execute("SELECT * FROM PaymentsSchema.Payments")
    payments_after = cursor.fetchall()

    assert payments_before == payments_after

    db_connection.commit()
    cursor.close()
