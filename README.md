# NHL Hockey Hub — Beginner Full-Stack CRUD with Prisma 7

This teaching project intentionally keeps the app small: **one React page**, **one Express API file**, **two Prisma models** and **PostgreSQL in Docker**.

## Prerequisites
- Node.js 22 LTS (or a Prisma-7-supported Node version)
- npm
- Docker Desktop running
- PowerShell on Windows, or any other terminal

## Start in this exact order

### 1. Start PostgreSQL in Docker
From the project root:

```powershell
docker compose up -d
docker compose ps
```

Docker creates PostgreSQL user `nhl_user`, password `nhl_password`, and database `nhl_hub`. Port `5444` on your computer connects to PostgreSQL port `5432` in Docker. All values are for **local learning only**; use real secrets and tighter security outside a demo.

### 2. Install backend dependencies and configure DB connection
Open a **new PowerShell terminal**:

```powershell
cd backend
Copy-Item .env.example .env
npm install
```

Check `backend/.env`:
```
DATABASE_URL="postgresql://nhl_user:nhl_password@localhost:5444/nhl_hub?schema=public"
PORT=3000
```

### 3. Generate Prisma client and create database tables
In `backend/`:

```powershell
npm run db:generate
npm run db:migrate
```

`db:generate` generates typed Prisma Client code. `db:migrate` creates the `Team` and `Player` database tables from `prisma/schema.prisma` and writes a migration file. If Prisma asks to install packages, check you are in `backend/` and `npm install` succeeded.

### 4. Seed NHL example data
In `backend/`:

```powershell
npm run db:seed
```

Seeds Winnipeg Jets and Toronto Maple Leafs, and three sample players. Re-running the seed generally won't duplicate the same teams or numbered players.

### 5. Start the Express backend
In `backend/`:

```powershell
npm run dev
```

Verify: http://localhost:3000/api/teams and http://localhost:3000/api/players

### 6. Start the React frontend
Open **another PowerShell terminal** from project root:

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## CRUD activities
1. Create a team with name `Calgary Flames`, code `CGY`, city `Calgary`.
2. Edit that team's city.
3. Add a player and assign them to that team.
4. Edit that player's jersey number.
5. Delete the player.
6. Delete the now-empty team.

Note: deleting a team with assigned players produces an explanation instead of silently deleting the players.

## Inspect the database
From backend terminal, use Prisma Studio:
```powershell
npm run db:studio
```
Alternatively run SQL within Docker:
```powershell
docker compose exec db psql -U nhl_user -d nhl_hub -c 'SELECT * FROM "Team";'
```
(Execute the second command from the project root.)

## Understanding the code
- `docker-compose.yml`: launches PostgreSQL and stores data in a named volume
- `backend/prisma/schema.prisma`: defines Team and Player tables plus their relationship
- `backend/prisma.config.ts`: tells Prisma which database URL and seed command to use
- `backend/prisma/seed.ts`: loads demonstration records
- `backend/src/prisma.ts`: creates a Prisma Client using the required PostgreSQL driver adapter
- `backend/src/server.ts`: defines GET / POST / PUT / DELETE routes
- `frontend/src/App.tsx`: forms, list, state, and simple fetch calls

## Key teaching note
Use React/Express locally first. **Do not** run `docker compose up --build` expecting to build the frontend and backend; Docker Compose only starts the database in this beginner edition. Prisma migration and seed steps must be run explicitly.

## Troubleshooting
- `DATABASE_URL missing`: confirm `backend/.env` exists; don't confuse `.env.example` and `.env`.
- `P1001`: Docker DB may not be ready; run `docker compose ps` and check its health.
- `port 5444 already allocated`: edit both `docker-compose.yml` host port and `.env` port consistently.
- Browser `Failed to fetch`: check `npm run dev` is running in backend and port 3000 is accessible.
- `P2002` / HTTP 409: team code or jersey number within the same team must be unique.
- Want to wipe data? `docker compose down -v` **deletes all database contents**. Don't use it casually.

## Next learning exercise
After understanding this working version, refactor `App.tsx` into `TeamForm`, `PlayerForm`, and a `useHockey` hook, then split Express routes into controllers, services, and repositories. This introduces layered architecture without hiding the initial request flow.
