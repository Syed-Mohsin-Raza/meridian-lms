# Meridian LMS

Portfolio-grade loan management platform — Spring Boot 4.1.1 + Java 25 + PostgreSQL 16 + Redis 7 + Next.js 15.

## Status

Backend complete (51 tests passing). Frontend complete (customer portal + admin panel).
See [Roadmap](#roadmap) for planned improvements.

## Tech Stack

| Layer | Stack |
|---|---|
| Backend | Spring Boot 4.1.1, Java 25, Spring Security 7 |
| Database | PostgreSQL 16 + Flyway (V1–V11) |
| Cache | Redis 7 |
| Auth | JWT (HS512) + BCrypt cost 12 |
| AI | Spring AI 2.0.1 (provider-agnostic) |
| Audit | Hibernate Envers 7.4.5 |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind 3.4 |
| Testing | JUnit 5, MockMvc, Testcontainers 1.21.3 |
| Observability | Actuator, Micrometer, Prometheus, Grafana |
| API Docs | SpringDoc OpenAPI 3.1.0 |

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@lms.com | Admin@1234 |
| Employee | goku@gmail.com | Goku1234 |

## Quick Start

    cp .env.example .env
    docker compose up -d

Backend on `:4000`, frontend on `:3000`.

## Documentation

- [Authentication design](docs/auth.md)
- [Security scan results](docs/security/README.md)
- [Load testing results](docs/load-testing/README.md)
- [Scaling path](docs/scaling.md)

## Roadmap

- [ ] Partial payment support
- [ ] Credit score history tracking
- [ ] Loan cancellation flow
- [ ] Officer assignment workflow
- [ ] Two-step approval (employee → manager)
- [ ] Frontend: httpOnly cookie auth migration (Tier 3)

## Known Limitations

- JWT stored in sessionStorage (Tier 2 of 4 — see [docs/auth.md](docs/auth.md))
- Rate limiter is in-memory (single-instance)
- AI narratives fall back to template when disabled
