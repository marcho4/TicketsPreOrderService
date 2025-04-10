"""
Вспомогательные функции и утилиты для тестов
"""
import json
import random
import string
import uuid
from datetime import datetime, timedelta

def generate_random_string(length=10):
    """Генерирует случайную строку указанной длины"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def generate_guid():
    """Генерирует случайный GUID"""
    return str(uuid.uuid4())

def generate_future_date(days_ahead=10):
    """Генерирует дату в будущем"""
    return (datetime.now() + timedelta(days=days_ahead)).isoformat()

def generate_match_data(organizer_id=None):
    """Генерирует тестовые данные для создания матча"""
    if organizer_id is None:
        organizer_id = generate_guid()
        
    return {
        "teamHome": f"Team Home {generate_random_string(5)}",
        "teamAway": f"Team Away {generate_random_string(5)}",
        "matchDateTime": generate_future_date(),
        "stadium": f"Stadium {generate_random_string(8)}",
        "matchDescription": f"Test match description {generate_random_string(20)}"
    }

def generate_update_match_data():
    """Генерирует тестовые данные для обновления матча"""
    return {
        "teamHome": f"Updated Team Home {generate_random_string(5)}",
        "teamAway": f"Updated Team Away {generate_random_string(5)}",
        "matchDateTime": generate_future_date(days_ahead=15),
        "stadium": f"Updated Stadium {generate_random_string(8)}",
        "matchDescription": f"Updated test match description {generate_random_string(20)}"
    } 