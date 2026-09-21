## Findings

### BCrypt is the login bottleneck (auth.js)
At 50 VU load, the first 5 requests per IP run BCrypt cost 12 (~250ms each).
The rate limiter absorbs 91.5% of subsequent requests in p95=6.65ms.
**Takeaway:** Rate limiter protects the expensive password path.

Threshold assertion:
- `rate_limit_hits > 700` — filter absorbs most traffic
- `bcrypt_attempts < 400` — BCrypt is not spammed