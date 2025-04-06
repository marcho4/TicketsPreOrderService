"""
Конфигурационный файл для тестов микросервиса матчей
"""

# Базовый URL для API микросервиса матчей
BASE_URL = "http://localhost:8005/api/match"

# Настройки для тестов нагрузки
STRESS_TEST_CONFIG = {
    "duration_seconds": 30,
    "users": 10,
    "spawn_rate": 2,
    "target_rps": 20
} 