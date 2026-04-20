# TrustTrade Backend

Node.js + Express + Prisma + PostgreSQL backend for TrustTrade.

## Prerequisites

- Node.js 18+
- PostgreSQL 15+

Create a local database named `trusttrade` and ensure PostgreSQL is running on `localhost:5432`.

Example using `psql`:

```sql
CREATE DATABASE trusttrade;
```

## Quick Start

1. Install dependencies
   ```bash
   npm install
   ```
2. Copy environment file
   ```bash
   cp .env.example .env
   ```
   PowerShell alternative:
   ```powershell
   Copy-Item .env.example .env
   ```
3. Generate Prisma client
   ```bash
   npm run prisma:generate
   ```
4. Apply schema to database
   ```bash
   npm run db:push
   ```
5. Seed sample data
   ```bash
   npm run seed
   ```
6. Run development server
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:4000` by default.

## API Prefix

All routes use `/api/v1`.

## Authentication

Use `Authorization: Bearer <token>` for protected routes.

## Key Routes

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/trades`
- `POST /api/v1/trades`
- `POST /api/v1/trades/:tradeId/join`
- `POST /api/v1/trades/:tradeId/status`
- `GET /api/v1/wallet`
- `POST /api/v1/disputes`
- `GET /api/v1/notifications`

## Notes

- Monetary updates are handled in database transactions.
- Seed script creates demo accounts and baseline trade/dispute data.
