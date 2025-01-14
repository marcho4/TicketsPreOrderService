FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libpq-dev \
    libcurl4-openssl-dev \
    g++ \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /AuthorizationService

COPY . .

WORKDIR /AuthorizationService/cmake-build-debug
RUN rm -rf *

WORKDIR /AuthorizationService
RUN cmake

CMD ["./cmake-build-debug/main"]

EXPOSE 8081