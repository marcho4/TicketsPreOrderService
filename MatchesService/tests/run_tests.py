"""
Скрипт для запуска всех тестов для микросервиса матчей
"""
import os
import sys
import subprocess
import argparse

def run_tests(test_type='all'):
    """
    Запускает тесты указанного типа
    
    Args:
        test_type (str): Тип тестов для запуска (unit, integration, all)
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    if test_type == 'unit' or test_type == 'all':
        print("\n=== Запуск модульных тестов ===\n")
        unit_tests_dir = os.path.join(current_dir, 'unit')
        subprocess.run([sys.executable, '-m', 'pytest', unit_tests_dir, '-v'])
    
    if test_type == 'integration' or test_type == 'all':
        print("\n=== Запуск интеграционных тестов ===\n")
        integration_tests_dir = os.path.join(current_dir, 'integration')
        subprocess.run([sys.executable, '-m', 'pytest', integration_tests_dir, '-v'])
    
    if test_type == 'stress':
        print("\n=== Запуск тестов на нагрузку ===\n")
        stress_tests_dir = os.path.join(current_dir, 'stress')
        subprocess.run([sys.executable, '-m', 'locust', '-f', 
                        os.path.join(stress_tests_dir, 'locustfile.py'), 
                        '--host=http://localhost:8005'])

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Запуск тестов для микросервиса матчей')
    parser.add_argument('--type', choices=['unit', 'integration', 'stress', 'all'], 
                        default='all', help='Тип тестов для запуска')
    
    args = parser.parse_args()
    run_tests(args.type) 