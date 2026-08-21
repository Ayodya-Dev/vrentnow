<div align="center">

# VRentNow

**Online vehicle rental and booking system**

Customer website, admin console, and REST API in one Turborepo monorepo.

[Live site](https://vrentnow.live) · [Admin](https://admin.vrentnow.live) · [GitHub](https://github.com/Ayodya-Dev/vrentnow)

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS_11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma_7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)](https://turbo.build/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## Project overview

VRentNow is a full-stack web platform for vehicle rental businesses. Customers browse vehicles, book by date, pay online, track booking status, and download receipts. Administrators manage the fleet, confirm bookings, upload handover documents, and supervise customers, payments, and audit activity.

The system replaces informal booking (phone, WhatsApp, spreadsheets) with one database, a live availability check, a clear booking workflow, and digital handover records.

This repository is the SEN4002 Software Design & Development (PORT1) team project. The live deployment is [https://vrentnow.live](https://vrentnow.live).

---

## Live URLs

| App | URL | Port (local) |
| --- | --- | --- |
| Customer website | https://vrentnow.live | `http://localhost:3000` |
| Admin console | https://admin.vrentnow.live | `http://localhost:3001` |
| REST API + Swagger | `/v1` on the API host | `http://localhost:9000` · docs at `/doc` |

---

## Technology stack

| Layer | Technology |
| --- | --- |
| Monorepo | Turborepo, Bun workspaces |
| Customer web | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, TanStack Query |
| Admin console | Next.js 16 (separate app) |
| Backend API | NestJS 11, TypeScript |
| Database / ORM | PostgreSQL, Prisma 7 |
| Auth | NestJS ES256 JWTs (access + refresh), bcrypt, NextAuth v5 session cookie, optional Google OAuth |
| Authorisation | RBAC — permissions enforced on API routes |
| Payments | PayHere (live/sandbox), KokoPay, Payzy |
| Email | Brevo HTTP API in production; log transport in development |
| Files | Local disk in development; Amazon S3 in production (uploads and database backups) |
| PDF receipts | Generated on the API (PDFKit) |
| Testing | Playwright (e2e) |
| Deployment | Docker on a Contabo Linux VPS, Cloudflare DNS + HTTPS, Spaceship domain, GitHub auto-deploy on `main` |

**Package manager:** [Bun](https://bun.sh/) (`bun install`, `bun dev`, `bun run build`). Do not use npm for this repo.

---

## Repository layout

```
apps/
  web/       Customer website          :3000
  admin/     Admin console             :3001
  backend/   NestJS API + Prisma       :9000   (Swagger at /doc)
packages/
  ui/                Shared UI components and theme
  api-client/        Typed client generated from the API OpenAPI contract
  eslint-config/     Shared ESLint config
  typescript-config/ Shared TypeScript configs
```

The backend is the identity source of truth (users, password hashing, JWTs, sessions). NextAuth in the frontends holds those tokens in an encrypted cookie and optionally runs the Google OAuth redirect.

---

## Features

### Customer website

- Register, login, logout, password reset / change, optional Google sign-in
- Browse and filter vehicles (type, dates, availability)
- Vehicle detail, deals, contact / inquiries
- Create a booking (pickup/return dates, cost breakdown)
- Pay with PayHere, KokoPay, or Payzy
- Download PDF receipt
- Track status: Pending → Confirmed → Handed Over → Completed (or Cancelled)
- Booking history, favourites, notifications
- Submit a review after a completed rental
- Submit a damage report
- View handover documents after collection

### Admin console

- Dashboard statistics
- Vehicles and categories (CRUD)
- Bookings: confirm, cancel, update status
- Upload handover documents (NIC/passport, driving licence, signed agreement)
- Customers (activate / suspend)
- Deals and inquiries
- Staff roles (RBAC)
- Audit log (mutations recorded against the acting user)

### Security (already in the API)

- Passwords hashed with bcrypt
- ES256 JWT access tokens + refresh rotation
- Account lockout after ten consecutive failed logins
- Rate limiting (IP and credentials)
- HTTPS in production (Cloudflare)
- Encrypted NextAuth session cookies
- Permissions checked on the server, not only in the UI

---

## Booking status flow

```
Pending → Confirmed → Handed Over → Completed
                    ↘ Cancelled
```

| Status | Meaning |
| --- | --- |
| Pending | Booking created, waiting for admin confirmation |
| Confirmed | Admin approved — customer may collect the vehicle |
| Handed Over | Physical handover done; documents uploaded |
| Completed | Vehicle returned |
| Cancelled | Booking cancelled |

---

## In scope / out of scope

**In scope:** vehicle search and availability, online booking workflow, PayHere / KokoPay / Payzy, PDF receipts, admin confirmation and handover uploads, customer accounts, favourites, notifications, reviews, damage reports, RBAC, transactional email, responsive web UI.

**Out of scope:** native iOS/Android apps, GPS / live vehicle tracking, multi-company / franchise tenancy, third-party insurance APIs, multi-currency.

---

## Getting started (developers)

### Prerequisites

- [Bun](https://bun.sh/) **1.3+**
- [Node.js](https://nodejs.org/) **20+** (required by Next.js)
- [PostgreSQL](https://www.postgresql.org/) **16** (local install, or Docker)
- [Git](https://git-scm.com/)
- On Windows, `bun run keys:generate` needs **Git Bash** or **WSL** (it runs a bash script)

### 1. Clone

```bash
git clone https://github.com/Ayodya-Dev/vrentnow.git
cd vrentnow
```

### 2. Install dependencies

From the **repository root**:

```bash
bun install
```

### 3. Start PostgreSQL

Either run Postgres yourself, or from the repo root:

```bash
docker compose up -d db
```

Default connection (see `apps/backend/.env.example`):

```
postgresql://postgres:postgres@localhost:5432/groundwork
```

If port 5432 is already in use, set `POSTGRES_PORT` and update `DATABASE_URL` to match.

### 4. Backend environment and database

```bash
cd apps/backend
cp .env.example .env
```

Set at least:

- `DATABASE_URL`
- `DATA_ENCRYPTION_KEY` — `openssl rand -base64 32`
- `AUTH_EXCHANGE_SECRET` — same value as in web and admin
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` (defaults:  / `)

Then:

```bash
bun run keys:generate    # EC P-256 keypair for JWT signing (apps/backend/keys/)
bun run db:migrate       # create the schema
bun run db:seed          # SUPER_ADMIN + sample data
```

Leave `FILES_DRIVER=local` and `MAIL_TRANSPORT=log` for local work. No AWS or Brevo account is required to run the app.

### 5. Frontend environment

```bash
cd apps/web
cp .env.example .env.local
# set AUTH_SECRET (openssl rand -base64 32)
# set AUTH_EXCHANGE_SECRET to match the backend
# AUTH_URL=http://localhost:3000

cd ../admin
cp .env.example .env.local
# different AUTH_SECRET from web
# same AUTH_EXCHANGE_SECRET as the backend
# AUTH_URL=http://localhost:3001
```

Google OAuth (`AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`) is optional. Email/password login works without it.

### 6. Run everything

From the **repository root**:

```bash
bun dev
```

| App | URL |
| --- | --- |
| Customer site | http://localhost:3000 |
| Admin console | http://localhost:3001 |
| API / Swagger | http://localhost:9000/doc |

Sign in to the admin console with the seeded account (`ADMIN_EMAIL` / `ADMIN_PASSWORD` in `apps/backend/.env`).

---

## Docker (whole stack)

From the repository root:

```bash
cp .env.example .env
# fill DATA_ENCRYPTION_KEY, AUTH_EXCHANGE_SECRET, AUTH_SECRET
#   openssl rand -base64 32   (once per secret)

cd apps/backend
bun run keys:generate
cd ../..

docker compose up --build
```

Images are built from the **repo root**. Signing keys are mounted into the container; they are not copied into the image.

---

## Useful commands

Run these from the repository root unless noted.

| Command | Purpose |
| --- | --- |
| `bun install` | Install workspace dependencies |
| `bun dev` | Web, admin, and API together |
| `bun run build` | Production build (regenerates the API client first) |
| `bun run lint` | Lint the workspace |
| `bun run typecheck` | TypeScript check |
| `bun run format` | Prettier |
| `bun run test` | Vitest + Jest (from each app as configured) |
| `bun run test:int` | Backend HTTP tests against a real database (`apps/backend`) |
| `bunx turbo test:e2e` | Playwright — backend must be running and seeded |

Backend-only (`apps/backend`): `db:migrate`, `db:seed`, `db:deploy`, `keys:generate`, `openapi`.

---

## User guide (short)

### Customer

1. Open https://vrentnow.live (or http://localhost:3000).
2. Register or sign in.
3. Browse **Vehicles**, pick dates, open a vehicle, and create a booking.
4. Complete payment (PayHere / KokoPay / Payzy).
5. Open **My Bookings** to see status, download the PDF receipt, or cancel if still allowed.
6. After a completed rental, submit a review. After collection, handover photos appear on the booking.

### Administrator

1. Open https://admin.vrentnow.live (or http://localhost:3001).
2. Sign in with a staff / SUPER_ADMIN account.
3. Use **Vehicles** and **Categories** to maintain the fleet.
4. Open **Bookings** to confirm or cancel, then upload NIC, licence, and agreement photos at handover.
5. Use **Customers**, **Deals**, **Inquiries**, **Staff**, and **Audit log** as needed.

---

## Testing

- **Playwright** — end-to-end tests under `apps/web/e2e/` and `apps/admin/e2e/` (registration, login, booking, payment paths, admin CRUD).
- **Jest** — backend unit and integration tests (`apps/backend`).
- **Vitest** — frontend unit tests.

The backend must be running (and usually seeded) before Playwright.

---

## Environment files (do not commit)

| File | Used by |
| --- | --- |
| `apps/backend/.env` | API, Prisma, JWT keys, mail, PayHere |
| `apps/web/.env.local` | Customer Next.js app |
| `apps/admin/.env.local` | Admin Next.js app |
| `.env` (repo root) | Docker Compose only |

`.env*`, `keys/`, and `storage/` are gitignored. Copy from each `.env.example`.

---

## Team

SEN4002 Software Design & Development — ICBT / Cardiff Metropolitan University.

| Student name | Cardiff ID | ICBT student ID | Contribution |
| --- | --- | --- | --- |
| Ayodya Sasanka Muthukumaru | st20353183 | CL/BSCSE-CMU/10/01 | Team leadership; frontend and backend ,API; system architecture; hosting and integration; limited QA support; final report |
| P.V.A. Chamath Sandaru | st20353188 | CL/BSCSE-CMU/10/07 | Primary UX/UI designer; full UI design in Figma; wireframes; selected frontend pages; manual testing and test evidence; final report |
| A.A. Sachira Samuditha | st20353185 | CL/BSCSE-CMU/10/04 | Full QA; automated testing; manual and edge-case testing; test evidence and defect reporting; selected frontend pages; final report|
| A.T.R. Mahendrasekara | st20353191 | CL/BSCSE-CMU/10/11 | Requirements gathering; full system analysis; selected frontend page development; manual testing and test evidence; final report |

---

## Academic use

This project was built for the SEN4002 module. It is not a commercial product licence. Do not commit secrets (`.env`, JWT keys, payment merchant secrets) to GitHub.
