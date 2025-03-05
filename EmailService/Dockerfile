# Используем более лёгкий образ
FROM python:3.13-slim AS base

# Устанавливаем зависимости и создаём изолированное окружение
FROM base AS builder
WORKDIR /app

# Устанавливаем системные зависимости, необходимые для сборки
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Копируем только файл зависимостей сначала (чтобы кешировались слои)
COPY requirements.txt .

# Устанавливаем зависимости в виртуальное окружение (чтобы избежать конфликтов)
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# Основной слой с минимальными зависимостями
FROM base
WORKDIR /app

# Копируем установленное окружение из builder
COPY --from=builder /opt/venv /opt/venv
COPY . .

# Используем установленное виртуальное окружение
ENV PATH="/opt/venv/bin:$PATH"

CMD ["python", "kafka.py"]