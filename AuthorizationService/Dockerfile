FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libpq-dev \
    g++ \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

RUN pip3 install -r tests/requirements.txt

WORKDIR /app/cmake-build-debug
RUN cmake .. && make

CMD ["./main"]

EXPOSE 8081