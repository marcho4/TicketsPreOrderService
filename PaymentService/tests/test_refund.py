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


def create_payment(payment_data):
    response = requests.post(f"{BASE_URL}/payments/create", json=payment_data)
    assert response.status_code == 201
    return response.json()


@pytest.mark.parametrize("payment_data, expected_status_code", [
    (
            {
                "user_id": "03e40c24-1d2c-2943-90e7-ad58cd17192f",
                "amount": "100.00",
                "currency": "USD",
                "provider": "PayPal",
                "match_id": "03e40c24-1d2c-2341-90e7-ad58cd17192f",
                "ticket_id": "03e40c24-1d2c-3803-90e7-ad58cd17192f"
            },
            200,
    )
])
def test_payment_refund(db_connection, payment_data, expected_status_code):
    payment = create_payment(payment_data)
    payment_id = payment["payment_id"]

    response = requests.post(f"{BASE_URL}/payments/{payment_id}/refund")
    assert response.status_code == expected_status_code

    json_response = response.json()
    assert json_response["data"]["match_id"] == payment_data["match_id"]
    assert json_response["data"]["ticket_id"] == payment_data["ticket_id"]

    cursor = db_connection.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM PaymentsSchema.Refunds WHERE payment_id = %s", (payment_id,))
    response = cursor.fetchall()

    assert len(response) == 1


def test_refund_non_existing_payment(db_connection):
    cursor = db_connection.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM PaymentsSchema.Refunds")
    refunds_before = cursor.fetchall()

    response = requests.post(f"{BASE_URL}/payments/03e40c24-1d2c-2943-90e7-ad58cd17192f/refund")
    assert response.status_code == 404
    assert response.json()["message"] == "Payment with this id does not exist"

    cursor.execute("SELECT * FROM PaymentsSchema.Refunds")
    refunds_after = cursor.fetchall()

    assert refunds_before == refunds_after


