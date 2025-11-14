# Medilogs – Backend

REST API built with Node.js and TypeScript to manage medical consultations for patients.

## Tech stack

- Node.js + TypeScript
- Express
- PostgreSQL (via `pg`)
- Docker & Docker Compose
- Jest + ts-jest (tests)
- `bcryptjs` (password hashing)
- CORS, Morgan (logging)

## Requirements

- Node.js (v18+ recommended)
- Docker and Docker Compose (for the database)

## Installation & Usage

1. Install dependencies:

```powershell
npm install
```

2. Start in development mode (brings up the DB and runs the TypeScript watcher):

```powershell
npm run dev
```

3. Build and run production:

```powershell
npm run build
node ./dist/server.js
```

4. Run tests:

```powershell
npm run test
```

## Database

- The `docker-compose.yml` defines a `postgres` service that mounts `src/db/script.sql` to `/docker-entrypoint-initdb.d/01-init.sql`. That SQL script runs automatically the first time the container is created.
- Alternatively, the npm script `db:init` copies `src/db/script.sql` into a running container and executes it using `psql`:

```powershell
npm run db:init
```

Environment variables (defaults are set in `docker-compose.yml`):

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=medilogs
```

## Project structure (high level)

```text
src/
  app.ts                # Express configuration and middlewares
  server.ts             # HTTP server bootstrap
  db/
    connection.ts       # PostgreSQL connection pool
    script.sql          # SQL script for creating tables
  role/
    doctor/             # Doctor entity, repository, controller, routes
    patient/            # Patient entity, repository, controller, routes
    consultation/       # Consultation entity, repository, controller, routes
```

## Main routes

Routes are organized under `src/role/*`. Open the `*.routes.ts` files inside each folder (`doctor`, `patient`, `consultation`) to see available endpoints and their request/response shapes.

# Medilogs – Backend

API REST en Node.js + TypeScript para gestionar consultas médicas de pacientes.

## Stack tecnológico

- Node.js + TypeScript
- Express
- PostgreSQL (vía `pg`)
- Docker + Docker Compose
- Jest + ts-jest (tests)
- `bcryptjs` (hash de contraseñas)
- CORS, Morgan (logging)

## Requisitos

- Node.js'
- Docker y Docker Compose (para ejecutar la base de datos)