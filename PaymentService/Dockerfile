FROM ubuntu:22.04

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

RUN wget https://github.com/jtv/libpqxx/archive/refs/tags/7.9.0.tar.gz && \
    tar -xvzf 7.9.0.tar.gz && \
    cd libpqxx-7.9.0 && \
    cmake -B build . && \
    cmake --build build --target install && \
    cd .. && rm -rf libpqxx-7.9.0 7.9.0.tar.gz

WORKDIR /app

COPY . .

RUN mkdir -p build && \
    cd build && \
    cmake .. && \
    make VERBOSE=1

CMD ["bash", "-c", "./build/PaymentService"]

EXPOSE 8008