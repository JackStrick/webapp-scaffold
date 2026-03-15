# Webapp Scaffold

A full-stack monorepo with an Express TypeScript REST API and React frontend.

## Structure

```
webapp-scaffold/
├── backend/    # Express + TypeScript + Prisma + PostgreSQL
├── frontend/   # Vite + React + TypeScript + Tailwind CSS
└── README.md
```

## Prerequisites

- Node.js 18+
- npm 8+
- A PostgreSQL database (see [Database Setup](#database-setup))

## Database Setup

This project uses [Neon](https://neon.tech) (serverless PostgreSQL).

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the Neon dashboard (it looks like `postgresql://user:password@host/dbname?sslmode=require`)
4. Paste it into `backend/.env` as `DATABASE_URL`

## Getting Started

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set DATABASE_URL
npm install
npm run migrate     # Run database migrations
npm run seed        # Seed initial data
npm run dev         # Start dev server on :8080
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev         # Start dev server on :3000
```

## API Endpoints

| Method | Path                 | Description                  |
| ------ | -------------------- | ---------------------------- |
| POST   | /api/messages        | Create a Hello World message |
| GET    | /api/messages        | Get all messages             |
| GET    | /api/messages/latest | Get latest messages          |
| GET    | /api/messages/:id    | Get message by ID            |

## Scripts

Both packages share the same script naming conventions:

| Script           | Description              |
| ---------------- | ------------------------ |
| `dev`            | Start development server |
| `build`          | Compile for production   |
| `lint`           | Run ESLint               |
| `lint:fix`       | Fix ESLint issues        |
| `check`          | Run lint + typecheck     |
| `typecheck`      | TypeScript type checking |
| `format:check`   | Prettier check           |
| `format:write`   | Prettier format          |
| `test`           | Run tests                |

### Backend only

| Script           | Description                     |
| ---------------- | ------------------------------- |
| `migrate`        | Run Prisma migrations (dev)     |
| `migrate:deploy` | Run migrations (production)     |
| `seed`           | Seed the database               |

## Auth Path

Auth is not implemented but the scaffold is ready for it:

- `backend/src/middleware/auth.ts` — JWT middleware stub (commented out)
- `backend/prisma/schema.prisma` — `User` model (commented out)

To add auth: uncomment the `User` model, run a migration, implement the JWT middleware, and add `requireAuth` to protected routes.

## Types

Both packages define matching TypeScript interfaces in `src/types/message.ts`. Keep these in sync when modifying the API contract.
