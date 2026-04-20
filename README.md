# TrustTrade

TrustTrade is an escrow-focused trade platform with a React frontend and a Node.js + PostgreSQL backend.

## Project Structure

- `src/` - Frontend (React + Vite)
- `server/` - Backend API (Express + Prisma + PostgreSQL)

## Prerequisites

- Node.js 18+
- PostgreSQL 15+

## Quick Start

1. Install root dependencies
	```bash
	npm install
	```
2. Install backend dependencies
	```bash
	npm --prefix server install
	```
3. Create backend env file
	```bash
	cp server/.env.example server/.env
	```
	PowerShell alternative:
	```powershell
	Copy-Item server/.env.example server/.env
	```
4. Ensure PostgreSQL is running and create database `trusttrade`
5. Push Prisma schema
	```bash
	npm --prefix server run db:push
	```
6. Seed demo data
	```bash
	npm --prefix server run seed
	```

## Development Commands

- Frontend only:
  ```bash
  npm run dev:client
  ```
- Backend only:
  ```bash
  npm run dev:server
  ```
- Frontend + backend together:
  ```bash
  npm run dev:full
  ```

Frontend default URL: `http://localhost:5173`
Backend default URL: `http://localhost:4000`

## API

API base path: `/api/v1`

Main endpoints:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/users/me`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/trades`
- `POST /api/v1/trades`
- `GET /api/v1/wallet`
- `POST /api/v1/disputes`
- `GET /api/v1/notifications`
