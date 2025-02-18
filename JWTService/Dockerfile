FROM rust:latest AS builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM ubuntu:latest
WORKDIR /app
COPY --from=builder /app/target/release/jwt_microservice /app/jwt_microservice
EXPOSE 8001
CMD ["./jwt_microservice"]