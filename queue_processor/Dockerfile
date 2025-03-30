# Этап 1: Использование cargo-chef для кэширования зависимостей
FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef
WORKDIR /app

# Этап 2: Планирование сборки
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# Этап 3: Сборка зависимостей и приложения
FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
RUN apt-get update && \
    apt-get install -y cmake pkg-config librdkafka-dev libssl-dev && \
    rm -rf /var/lib/apt/lists/*
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
RUN cargo build --release --bin queue_processor

# Этап 4: Финальный runtime-образ
FROM debian:bookworm-slim AS runtime
WORKDIR /app

RUN apt-get update && \
    apt-get install -y libssl3 ca-certificates librdkafka-dev && \
    rm -rf /var/lib/apt/lists/*

# Копирование бинарника из этапа сборки
COPY src/configs/docker.toml /app/docker.toml
COPY src/configs/dev.toml /app/dev.toml
RUN mkdir tmp
COPY --from=builder /app/target/release/queue_processor /app/queue_processor

EXPOSE 8020
CMD ["./queue_processor"]