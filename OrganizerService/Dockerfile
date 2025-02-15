# Используем базовый образ Ubuntu 22.04
FROM ubuntu:22.04

# Установка необходимых пакетов
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libpq-dev \
    libcurl4-openssl-dev \
    g++ \
    wget \
    libssl-dev \
    git \
    && rm -rf /var/lib/apt/lists/*


# Установка libpqxx из пакетного менеджера
RUN wget https://github.com/jtv/libpqxx/archive/refs/tags/7.7.5.tar.gz && \
    tar -xvzf 7.7.5.tar.gz && \
    cd libpqxx-7.7.5 && \
    cmake -B build . && \
    cmake --build build --target install && \
    cd .. && rm -rf libpqxx-7.7.5 7.7.5.tar.gz

RUN git clone https://github.com/rg3/bcrypt.git /tmp/bcrypt && \
    cd /tmp/bcrypt && \
    make && \
    cp bcrypt.a /usr/local/lib && \
    cp bcrypt.h /usr/local/include && \
    rm -rf /tmp/bcrypt

# Установка рабочего каталога
WORKDIR /app

# Копирование содержимого текущего каталога в контейнер
COPY . .

# Сборка приложения с помощью CMake
RUN mkdir -p build && \
    cd build && \
    cmake .. && \
    make VERBOSE=1

# Используем правильный исполняемый файл
CMD ["bash", "-c", "./build/OrganizerService"]

# Открытие порта
EXPOSE 8004