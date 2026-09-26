# Authentication Design

## Current: sessionStorage + Cookie Mirror

The JWT access token is stored in `sessionStorage` and mirrored to a non-httpOnly cookie for Next.js middleware.

### Why sessionStorage (Not localStorage)

`localStorage` persists across browser sessions and is shared across all tabs of the origin. `sessionStorage` clears when the tab closes, reducing the exposure window. Neither is XSS-safe.

### Why the Cookie Mirror

Next.js middleware runs on the edge runtime and cannot read `sessionStorage`. It reads the JWT cookie to enforce route protection before any React renders.

### Security Properties

| Threat | Mitigation |
|--------|-----------|
| XSS | Partial — sessionStorage is still readable; strict CSP limits injection |
| CSRF | `SameSite=Strict` on cookie |
| Token theft via browser extension | No protection |
| Physical access to unlocked device | No protection |

## Production Migration Path

### Tier 3: HttpOnly Cookies (recommended for production)

Move the JWT to an `httpOnly` cookie set by the backend. Add a CSRF token.

**Changes:**
- Backend: `AuthController.login` returns `Set-Cookie` with `HttpOnly; Secure; SameSite=Strict`
- Backend: new `POST /api/v1/auth/logout`
- Backend: new `POST /api/v1/auth/csrf` returns a CSRF token
- Frontend: remove `tokenStore`; all requests use `credentials: "include"`
- Frontend: attach `X-CSRF-Token` header to POST/PUT/DELETE

**Effort:** ~4 hours

**Benefit:** XSS cannot steal the token. CSRF is mitigated by the token exchange.

### Tier 4: In-Memory Access + HttpOnly Refresh (gold standard)

Split tokens: access (short-lived, in-memory) and refresh (long-lived, httpOnly cookie).

**Effort:** ~6 hours

**Benefit:** XSS exposure window drops to 15 minutes. No persistence = no long-lived theft.

## Current Trade-Offs (for review)

For a portfolio project, sessionStorage + cookie mirror is a defensible choice. It:
- Demonstrates understanding of the browser storage hierarchy
- Provides route protection via middleware
- Sets up a clean migration path to Tier 3

It does NOT:
- Protect against XSS token theft
- Provide MFA or device binding
- Meet PCI-DSS or SOC 2 requirements as-is

For regulated deployment, Tier 3 or 4 is required.
