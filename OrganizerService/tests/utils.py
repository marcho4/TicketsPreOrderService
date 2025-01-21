import random
import string


def generate_random_organization():
    words = ["Tech", "Solutions", "Industries", "Global", "Systems", "Dynamic", "Enterprises", "Innovations", "Digital"]
    return f"{random.choice(words)} {random.choice(words)}"


def generate_random_phone_number():
    return f"+7{random.randint(900, 999)}{random.randint(1000000, 9999999)}"


def generate_random_email():
    domains = ["gmail.com", "yandex.ru", "mail.ru", "outlook.com", "example.com"]
    name = ''.join(random.choices(string.ascii_lowercase, k=random.randint(5, 10)))
    return f"{name}@{random.choice(domains)}"


def generate_random_tin():
    return ''.join(random.choices(string.digits, k=12))
