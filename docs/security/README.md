# Security Scan Results

OWASP ZAP baseline scan run on 2026-09-22 against the dockerized backend on
`http://localhost:4000`.

## Result Summary

| Severity | Count |
|----------|-------|
| High | 0 |
| Medium | 0 |
| Low | 0 |
| Informational | 0 |
| False Positives | 0 |
| **PASS** (rules that ran clean) | **61** |

**Zero findings across all passive scan rules.** This means the security
posture of the API is clean for the checks ZAP baseline performs.

## What ZAP Baseline Checks

ZAP baseline is a **passive** scanner. It observes responses, doesn't send
attack payloads. It covers:

- Security headers (X-Content-Type-Options, X-Frame-Options, CSP, HSTS, etc.)
- Cookie flags (HttpOnly, Secure, SameSite)
- Information disclosure (server version, debug info, stack traces, PII in URLs)
- Content-type handling (charset, mixed content)
- CORS misconfiguration
- JS library vulnerabilities (Retire.js integration)
- Anti-CSRF token presence
- Server header leaks

## What ZAP Baseline Does *Not* Cover

- SQL injection, XSS, command injection (needs **active scan** with consent)
- Authentication bypass
- Business logic flaws
- Authorization issues (IDOR, privilege escalation)
- Rate limiting effectiveness

Active scans require written authorization for the target. For a portfolio
project, the baseline scan establishes the security hygiene baseline; deeper
testing would require an explicit authorization scope.

## Why the Report Is Clean

The clean result comes from several design decisions:

1. **No server version disclosure** — `server.tomcat.server-header: ""` in
   `application.yml`. ZAP rule 10036 (HTTP Server Response Header) passes.

2. **Security headers set on every response** — `SecurityHeadersFilter`
   (order 0) adds `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
   `Referrer-Policy: strict-origin-when-cross-origin`,
   `Permissions-Policy: geolocation=(), microphone=(), camera=()`,
   and a `Content-Security-Policy`.

3. **No cookies** — JWT in `Authorization` header, no `Set-Cookie` anywhere.
   Cookie-related rules (10010, 10011, 10054) trivially pass.

4. **No debug info leaked** — `GlobalExceptionHandler` returns a generic
   "Internal server error" for unhandled exceptions. Stack traces never
   leave the server.

5. **Generic validation errors** — `MethodArgumentTypeMismatchException`
   returns a specific but non-sensitive message (`Parameter 'id' must be of
   type Long`). No internal class names leaked.

6. **CSP set explicitly** — ZAP rule 10038 (CSP Header Not Set) passes.
   Our CSP permits Swagger UI inline scripts (needed for the docs page) but
   restricts everything else.

7. **Anti-clickjacking via `X-Frame-Options: DENY`** — ZAP rule 10020 passes.

## Accepted Design Decisions

These are intentional trade-offs, documented for reviewers:

- **CSRF disabled** — Stateless JWT auth with no session cookies. CSRF
  requires cookie-based authentication to be exploitable. Not applicable.

- **CSP allows `'unsafe-inline'` and `'unsafe-eval'`** — Required for
  Swagger UI. In production with `springdoc.api-docs.enabled=false`, the
  CSP can be tightened to `script-src 'self'`.

- **HTTP, not HTTPS** — The docker-compose stack serves HTTP on port 4000
  for local development. Production would terminate TLS at the load
  balancer (ALB, nginx). HSTS header (rule 10035) is applied at the TLS
  layer, not the app.

- **CORS `allowedOrigins: localhost:3000`** — Restricted to the frontend
  origin. Not `*`. If the frontend moves, update `SecurityConfig`.

## Reproducing the Scan

```bash
docker compose up -d

# Wait for health
sleep 15
curl http://localhost:4000/actuator/health

# Run baseline scan
mkdir -p docs/security
docker run --rm \
  -v $(pwd)/docs/security:/zap/wrk:rw \
  --network host \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py \
  -t http://localhost:4000 \
  -r zap-report.html \
  -J zap-report.json \
  -w zap-report.md
