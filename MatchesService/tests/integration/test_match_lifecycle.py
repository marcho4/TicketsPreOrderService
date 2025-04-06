"""
Интеграционные тесты для полного цикла работы с матчами
"""
import pytest
import requests
import json
import sys
import os
from datetime import datetime, timedelta

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

class TestMatchLifecycle:
    """Тест полного цикла жизни матча"""
    
    def test_full_match_lifecycle(self, check_server_availability):
        """Тест полного цикла: создание, получение, обновление, удаление"""
        # 1. Создаем организатора
        organizer_id = generate_guid()
        
        # 2. Создаем матч
        match_data = generate_match_data()
        create_response = requests.post(f"{BASE_URL}/create_match/{organizer_id}", json=match_data)
        assert create_response.status_code == 201
        match_id = create_response.json()["id"]
        
        # 3. Получаем созданный матч
        get_response = requests.get(f"{BASE_URL}/get_match/{match_id}")
        assert get_response.status_code == 200
        match_info = get_response.json()
        assert match_info["id"] == match_id
        assert match_info["organizerId"] == organizer_id
        assert match_info["teamHome"] == match_data["teamHome"]
        assert match_info["teamAway"] == match_data["teamAway"]
        assert match_info["stadium"] == match_data["stadium"]
        
        # 4. Проверяем, что матч появился в списке матчей организатора
        organizer_matches_response = requests.get(f"{BASE_URL}/get_organizer_matches/{organizer_id}")
        assert organizer_matches_response.status_code == 200
        organizer_matches = organizer_matches_response.json()
        assert isinstance(organizer_matches, list)
        assert any(match["id"] == match_id for match in organizer_matches)
        
        # 5. Обновляем матч
        update_data = generate_update_match_data()
        update_response = requests.put(f"{BASE_URL}/update_match/{match_id}", json=update_data)
        assert update_response.status_code == 200
        updated_match = update_response.json()
        assert updated_match["id"] == match_id
        assert updated_match["teamHome"] == update_data["teamHome"]
        assert updated_match["teamAway"] == update_data["teamAway"]
        
        # 6. Проверяем, что данные обновились
        get_updated_response = requests.get(f"{BASE_URL}/get_match/{match_id}")
        assert get_updated_response.status_code == 200
        updated_match_info = get_updated_response.json()
        assert updated_match_info["teamHome"] == update_data["teamHome"]
        assert updated_match_info["teamAway"] == update_data["teamAway"]
        assert updated_match_info["stadium"] == update_data["stadium"]
        
        # 7. Удаляем матч
        delete_response = requests.delete(f"{BASE_URL}/delete_match/{match_id}/{organizer_id}")
        assert delete_response.status_code == 204
        
        # 8. Проверяем, что матч удален
        get_deleted_response = requests.get(f"{BASE_URL}/get_match/{match_id}")
        assert get_deleted_response.status_code == 404
        
        # 9. Проверяем, что матч исчез из списка матчей организатора
        organizer_matches_after_delete = requests.get(f"{BASE_URL}/get_organizer_matches/{organizer_id}")
        assert organizer_matches_after_delete.status_code in [200, 204]
        
        # Если статус 200, проверяем, что матча нет в списке
        if organizer_matches_after_delete.status_code == 200:
            matches_after_delete = organizer_matches_after_delete.json()
            assert not any(match["id"] == match_id for match in matches_after_delete)
    
    def test_multiple_matches_for_organizer(self, check_server_availability):
        """Тест создания нескольких матчей для одного организатора"""
        # Создаем организатора
        organizer_id = generate_guid()
        
        # Создаем несколько матчей
        match_ids = []
        for i in range(3):
            match_data = generate_match_data()
            match_data["teamHome"] = f"Home Team {i+1}"
            match_data["teamAway"] = f"Away Team {i+1}"
            
            create_response = requests.post(f"{BASE_URL}/create_match/{organizer_id}", json=match_data)
            assert create_response.status_code == 201
            match_ids.append(create_response.json()["id"])
        
        # Получаем список матчей организатора
        organizer_matches_response = requests.get(f"{BASE_URL}/get_organizer_matches/{organizer_id}")
        assert organizer_matches_response.status_code == 200
        organizer_matches = organizer_matches_response.json()
        
        # Проверяем, что все созданные матчи присутствуют в списке
        for match_id in match_ids:
            assert any(match["id"] == match_id for match in organizer_matches)
        
        # Очищаем тестовые данные
        for match_id in match_ids:
            requests.delete(f"{BASE_URL}/delete_match/{match_id}/{organizer_id}")
    
    def test_invalid_operations(self, check_server_availability):
        """Тест операций с неверными данными"""
        # Создаем организатора и матч для дальнейших тестов
        organizer_id = generate_guid()
        match_data = generate_match_data()
        create_response = requests.post(f"{BASE_URL}/create_match/{organizer_id}", json=match_data)
        assert create_response.status_code == 201
        match_id = create_response.json()["id"]
        
        # 1. Попытка получить несуществующий матч
        non_existent_id = generate_guid()
        get_invalid_response = requests.get(f"{BASE_URL}/get_match/{non_existent_id}")
        assert get_invalid_response.status_code == 404
        
        # 2. Попытка обновить несуществующий матч
        update_data = generate_update_match_data()
        update_invalid_response = requests.put(f"{BASE_URL}/update_match/{non_existent_id}", json=update_data)
        assert update_invalid_response.status_code in [404, 400]
        
        # 3. Попытка удалить матч с неверным ID организатора
        wrong_organizer_id = generate_guid()
        delete_invalid_response = requests.delete(f"{BASE_URL}/delete_match/{match_id}/{wrong_organizer_id}")
        # В зависимости от реализации может быть разный статус, но не должен быть 2xx
        assert delete_invalid_response.status_code not in [200, 201, 202, 203, 204]
        
        # Очищаем тестовые данные
        requests.delete(f"{BASE_URL}/delete_match/{match_id}/{organizer_id}") 