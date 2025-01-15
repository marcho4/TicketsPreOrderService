FROM ubuntu:22.04

# Установка необходимых пакетов
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libpq-dev \
    libcurl4-openssl-dev \
    g++ \
    wget \
    python3 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Установка libpqxx из исходников
RUN wget https://github.com/jtv/libpqxx/archive/refs/tags/7.7.5.tar.gz && \
    tar -xvzf 7.7.5.tar.gz && \
    cd libpqxx-7.7.5 && \
    cmake -B build . && \
    cmake --build build --target install && \
    cd .. && rm -rf libpqxx-7.7.5 7.7.5.tar.gz

RUN git clone https://github.com/rg3/bcrypt.git /tmp/bcrypt && \
    cd /tmp/bcrypt && \
    make && \
    make install && \
    rm -rf /tmp/bcrypt \

# Установка рабочего каталога
WORKDIR /app

# Копирование содержимого текущего каталога в контейнер
COPY . .

RUN rm -rf build CMakeFiles CMakeCache.txt cmake_install.cmake

RUN mkdir -p build && \
    cd build && \
    cmake .. && \
    make

# Используем правильный исполняемый файл
CMD ["./build/AuthorizationService"]

# Открытие порта
EXPOSE 8081