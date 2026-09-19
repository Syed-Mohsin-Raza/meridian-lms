# Meridian LMS

> Production-grade loan management platform — Spring Boot 4 + PostgreSQL + Redis + Next.js.

## Status

🚧 Active development — backend complete (42 tests passing), frontend in progress.

## Tech Stack

- **Backend:** Spring Boot 4.1, Java 25, PostgreSQL 16, Redis 7
- **Auth:** JWT + Spring Security (BCrypt cost 12)
- **Observability:** Prometheus, Grafana, Micrometer
- **Testing:** JUnit 5, Testcontainers 1.21, MockMvc
- **API Docs:** Springdoc OpenAPI 3.1

## Quick Start

```bash
cp .env.example .env
docker compose up -d postgres redis adminer
cd backend && ./mvnw spring-boot:run