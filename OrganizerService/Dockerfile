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
    rm -rf /tmp/bcrypt \

WORKDIR /app

COPY . .

RUN mkdir -p build && \
    cd build && \
    cmake .. && \
    make VERBOSE=1

CMD ["bash", "-c", "./build/OrganizerService"]

EXPOSE 8004