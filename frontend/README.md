# Meridian LMS — Frontend

Next.js 15 App Router client for the Meridian Loan Management System.

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind 3.4 · Recharts · SWR · react-hook-form + Zod

## Setup

    npm install
    echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
    npm run dev

Runs on `http://localhost:3000`. Backend must be running on `:4000`.

## Structure

    src/
    ├── app/              # App Router pages
    │   ├── (auth)/       # login, register
    │   ├── (customer)/   # dashboard, loans, payments, profile
    │   └── admin/        # analytics, loans, customers, employees
    ├── components/       # UI primitives + feature components
    ├── lib/
    │   ├── api/          # per-domain API clients
    │   ├── auth/         # token storage (sessionStorage + cookie mirror)
    │   └── hooks/        # use-auth, use-pagination
    └── middleware.ts     # server-side route protection

## Auth

JWT stored in `sessionStorage`, mirrored to a non-httpOnly cookie for middleware.
See [../docs/auth.md](../docs/auth.md) for the design and migration path.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Environment Variables

| Name | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Backend base URL (baked at build time) |