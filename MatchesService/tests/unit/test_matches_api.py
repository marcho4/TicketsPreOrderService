"""
Модульные тесты для API микросервиса матчей
"""
import pytest
import requests
import json
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import BASE_URL
from utils import generate_guid, generate_match_data, generate_update_match_data

@pytest.fixture(scope="module")
def check_server_availability():
    """Проверяем доступность сервера перед выполнением тестов"""
    try:
        # Проверяем доступность API получив список всех матчей
        response = requests.get(f"{BASE_URL}/get_all_matches")
        assert response.status_code in [200, 204], f"Сервер недоступен, код ответа: {response.status_code}"
        return True
    except Exception as e:
        pytest.fail(f"Невозможно подключиться к серверу: {str(e)}")

@pytest.fixture
def organizer_id():
    """Возвращает тестовый ID организатора"""
    return generate_guid()

class TestMatchesAPI:
    """Тесты для API микросервиса матчей"""
    
    def test_get_all_matches(self, check_server_availability):
        """Тест получения списка всех матчей"""
        response = requests.get(f"{BASE_URL}/get_all_matches")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_create_match(self, check_server_availability, organizer_id):
        """Тест создания нового матча"""
        match_data = generate_match_data()
        response = requests.post(f"{BASE_URL}/create_match/{organizer_id}", json=match_data)
        assert response.status_code == 201
        data = response.json()
        assert data["teamHome"] == match_data["teamHome"]
        assert data["teamAway"] == match_data["teamAway"]
        assert data["stadium"] == match_data["stadium"]
        assert "id" in data
        return data["id"]
    
    def test_get_match_by_id(self, check_server_availability, organizer_id):
        """Тест получения матча по ID"""
        # Сначала создаем матч
        match_data = generate_match_data()
        create_response = requests.post(f"{BASE_URL}/create_match/{organizer_id}", json=match_data)
        assert create_response.status_code == 201
        match_id = create_response.json()["id"]
        
        # Теперь получаем матч по ID
        response = requests.get(f"{BASE_URL}/get_match/{match_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == match_id
        assert data["teamHome"] == match_data["teamHome"]
        assert data["teamAway"] == match_data["teamAway"]
    
    def test_get_matches_by_organizer(self, check_server_availability, organizer_id):
        """Тест получения матчей по ID организатора"""
        # Создаем матч для этого организатора
        match_data = generate_match_data()
        create_response = requests.post(f"{BASE_URL}/create_match/{organizer_id}", json=match_data)
        assert create_response.status_code == 201
        
        # Получаем матчи для организатора
        response = requests.get(f"{BASE_URL}/get_organizer_matches/{organizer_id}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        
        # Проверяем, что есть матч с правильным организатором
        assert any(match["organizerId"] == organizer_id for match in data)
    
    def test_update_match(self, check_server_availability, organizer_id):
        """Тест обновления матча"""
        # Сначала создаем матч
        match_data = generate_match_data()
        create_response = requests.post(f"{BASE_URL}/create_match/{organizer_id}", json=match_data)
        assert create_response.status_code == 201
        match_id = create_response.json()["id"]
        
        # Обновляем матч
        update_data = generate_update_match_data()
        response = requests.put(f"{BASE_URL}/update_match/{match_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        
        # Проверяем обновленные данные
        assert data["id"] == match_id
        assert data["teamHome"] == update_data["teamHome"]
        assert data["teamAway"] == update_data["teamAway"]
        assert data["stadium"] == update_data["stadium"]
        
    def test_delete_match(self, check_server_availability, organizer_id):
        """Тест удаления матча"""
        # Сначала создаем матч
        match_data = generate_match_data()
        create_response = requests.post(f"{BASE_URL}/create_match/{organizer_id}", json=match_data)
        assert create_response.status_code == 201
        match_id = create_response.json()["id"]
        
        # Удаляем матч
        response = requests.delete(f"{BASE_URL}/delete_match/{match_id}/{organizer_id}")
        assert response.status_code == 204
        
        # Проверяем, что матч удален
        get_response = requests.get(f"{BASE_URL}/get_match/{match_id}")
        assert get_response.status_code == 404
        
    def test_create_match_invalid_data(self, check_server_availability, organizer_id):
        """Тест создания матча с неверными данными"""
        # Неверные данные (пустые поля)
        invalid_data = {
            "teamHome": "",
            "teamAway": "",
            "matchDateTime": "",
            "stadium": "",
            "matchDescription": ""
        }
        
        response = requests.post(f"{BASE_URL}/create_match/{organizer_id}", json=invalid_data)
        assert response.status_code == 400 