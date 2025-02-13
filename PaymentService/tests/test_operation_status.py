import pytest
import requests
from config import BASE_URL
from config import DATABASE_CONFIG
import psycopg2
from psycopg2.extras import RealDictCursor


def create_payment(payment_data):
    response = requests.post(f"{BASE_URL}/payments/create", json=payment_data)
    assert response.status_code == 201
    return response.json()


def send_webhook(webhook_data):
    response = requests.post(f"{BASE_URL}/payments/webhook", json=webhook_data)
    assert response.status_code == 200


@pytest.mark.parametrize("payment_data, status, operation_type", [
    (
            {
                "user_id": "03e40c24-1d2c-2943-90e7-ad58cd17192f",
                "amount": "100.00",
                "currency": "USD",
                "provider": "PayPal",
                "match_id": "03e40c24-1d2c-2545-90e7-ad58cd17192f",
                "ticket_id": "03e40c24-1d2c-6442-90e7-ad58cd17192f"
            },
            "success",
            "PAYMENT"
    ),
    (
            {
                "user_id": "03e40c24-1d2c-3427-90e7-ad58cd17192f",
                "amount": "10000",
                "currency": "RUB",
                "provider": "Stripe",
                "match_id": "03e40c24-1d2c-6749-90e7-ad58cd17192f",
                "ticket_id": "03e40c24-1d2c-0394-90e7-ad58cd17192f"
            },
            "failed",
            "PAYMENT"
    )
])
def test_operation_status(payment_data, status, operation_type):
    payment = create_payment(payment_data)
    payment_id = payment["payment_id"]

    webhook_data = {
        "payment_id": payment_id,
        "status": status
    }
    send_webhook(webhook_data)

    response = requests.post(f"{BASE_URL}/payments/{payment_id}/status", json={"operation_type": operation_type})
    assert response.status_code == 200
    assert response.json()["status"] == status
