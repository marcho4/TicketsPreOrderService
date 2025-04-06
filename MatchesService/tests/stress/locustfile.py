"""
Тест на нагрузку для API микросервиса матчей с использованием locust
"""
import sys
import os
import uuid
import random
import json
from datetime import datetime, timedelta
from locust import HttpUser, task, between

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils import generate_guid, generate_match_data, generate_update_match_data

class MatchesUser(HttpUser):
    """Класс пользователя для тестирования нагрузки на API матчей"""
    
    # Ожидание между запросами от 1 до 5 секунд
    wait_time = between(1, 5)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.organizer_id = None
        self.match_ids = []
    
    def on_start(self):
        """Метод, выполняемый при старте пользовательской сессии"""
        self.organizer_id = generate_guid()
        
        # Создаем несколько матчей для дальнейшего использования в тестах
        for _ in range(2):
            match_data = generate_match_data()
            response = self.client.post(f"/api/match/create_match/{self.organizer_id}", 
                                        json=match_data, 
                                        name="/api/match/create_match/[organizer_id]")
            
            if response.status_code == 201:
                match_id = response.json()["id"]
                self.match_ids.append(match_id)
    
    def on_stop(self):
        """Метод, выполняемый при завершении пользовательской сессии"""
        # Удаляем созданные тестовые данные
        for match_id in self.match_ids:
            try:
                self.client.delete(f"/api/match/delete_match/{match_id}/{self.organizer_id}", 
                                 name="/api/match/delete_match/[match_id]/[organizer_id]")
            except Exception:
                pass
    
    @task(3)
    def get_all_matches(self):
        """Запрос получения всех матчей (выполняется с высокой частотой)"""
        self.client.get("/api/match/get_all_matches")
    
    @task(2)
    def get_organizer_matches(self):
        """Запрос получения матчей организатора"""
        if self.organizer_id:
            self.client.get(f"/api/match/get_organizer_matches/{self.organizer_id}", 
                          name="/api/match/get_organizer_matches/[organizer_id]")
    
    @task(2)
    def get_match_by_id(self):
        """Запрос получения матча по ID"""
        if self.match_ids:
            match_id = random.choice(self.match_ids)
            self.client.get(f"/api/match/get_match/{match_id}", 
                          name="/api/match/get_match/[match_id]")
    
    @task(1)
    def create_match(self):
        """Запрос создания матча"""
        match_data = generate_match_data()
        response = self.client.post(f"/api/match/create_match/{self.organizer_id}", 
                                  json=match_data, 
                                  name="/api/match/create_match/[organizer_id]")
        
        if response.status_code == 201:
            match_id = response.json()["id"]
            self.match_ids.append(match_id)
    
    @task(1)
    def update_match(self):
        """Запрос обновления матча"""
        if self.match_ids:
            match_id = random.choice(self.match_ids)
            update_data = generate_update_match_data()
            self.client.put(f"/api/match/update_match/{match_id}", 
                          json=update_data, 
                          name="/api/match/update_match/[match_id]")
    
    @task(1)
    def delete_match(self):
        """Запрос удаления матча"""
        if self.match_ids:
            match_id = self.match_ids.pop() # Берем последний ID и удаляем его из списка
            self.client.delete(f"/api/match/delete_match/{match_id}/{self.organizer_id}", 
                             name="/api/match/delete_match/[match_id]/[organizer_id]") 