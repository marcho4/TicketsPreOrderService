import random
import string


def create_random_string():
    return ''.join(random.choice(string.ascii_lowercase) for _ in range(10))


def create_random_birth_date():
    return f"{random.randint(10, 31)}:{random.randint(10, 12)}:{random.randint(1900, 2021)}"


def create_random_email():
    return f"{create_random_string()}@gmail.com"


def create_random_phone():
    return f"+7{random.randint(100, 999)}{random.randint(100, 999)}{random.randint(10, 99)}{random.randint(10, 99)}"
