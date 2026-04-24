# Local PostgreSQL + Prisma Setup

This guide is for setting up a **local PostgreSQL database** for development on this repo, while keeping the **VPS database** for production only.

## Recommended approach

- Use **local Postgres** for local development.
- Use the **VPS Postgres** only on the VPS.
- Make schema changes locally with Prisma.
- Deploy the same schema changes to VPS during deployment.

Do **not** point your laptop at the production database for normal development.

## Option A: Install PostgreSQL locally with Homebrew (macOS)

### 1. Install PostgreSQL

```bash
brew install postgresql@16
```

### 2. Add it to your shell path

For Apple Silicon Macs:

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

For Intel Macs:

```bash
echo 'export PATH="/usr/local/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 3. Start PostgreSQL

```bash
brew services start postgresql@16
```

### 4. Check that it is running

```bash
brew services list | rg postgresql
pg_isready -h localhost -p 5432
```

## Option B: Run PostgreSQL with Docker

If you do not want a native install:

```bash
docker run --name illustriober-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=illustriober_local \
  -p 5432:5432 \
  -d postgres:16
```

Check readiness:

```bash
docker ps
docker logs illustriober-postgres
```

## Create local role and database

If you used Docker with the defaults above, you can skip this section.

### 1. Open psql as the default superuser

```bash
psql postgres
```

### 2. Create a local app user

Use a development-only password:

```sql
CREATE ROLE illustriober_dev WITH LOGIN PASSWORD 'change-me-local-dev';
```

### 3. Create the local database

```sql
CREATE DATABASE illustriober_local OWNER illustriober_dev;
```

### 4. Grant privileges

```sql
GRANT ALL PRIVILEGES ON DATABASE illustriober_local TO illustriober_dev;
```

### 5. Exit psql

```sql
\q
```

## Verify the local connection

```bash
psql "postgresql://illustriober_dev:change-me-local-dev@localhost:5432/illustriober_local?schema=public"
```

If that opens a Postgres prompt, your local DB is reachable.

Exit with:

```sql
\q
```

## Connect this repo to the local DB

### 1. Copy the env template

From repo root:

```bash
cp apps/api/.env.example apps/api/.env
```

### 2. Edit `apps/api/.env`

Use a local-only connection string:

```env
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=replace-with-a-long-random-local-secret
ALLOW_PUBLIC_REGISTRATION=true
RESEND_API_KEY=
DATABASE_URL=postgresql://illustriober_dev:change-me-local-dev@localhost:5432/illustriober_local?schema=public
DIRECT_DATABASE_URL=
```

If you used the Docker defaults instead, use:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/illustriober_local?schema=public
```

## Bootstrap Prisma locally

### 1. Install dependencies

From repo root:

```bash
npm install
```

### 2. Validate Prisma schema

```bash
npm run prisma:validate --workspace api
```

### 3. Generate Prisma client

```bash
npm run prisma:generate --workspace api
```

### 4. Create tables in the local database

Because this repo does not yet have a mature checked-in migration history, the fastest first local bootstrap is:

```bash
npm run prisma:db:push --workspace api
```

## Start the app locally

### API

```bash
npm run dev --workspace api
```

### Web

In another terminal:

```bash
npm run dev --workspace web
```

## Verify everything works

### 1. API health

```bash
curl -i http://localhost:4000/health
```

### 2. Register route

```bash
curl -i -X POST http://localhost:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  --data '{"email":"test@example.com","password":"supersecret123","firstName":"Test","lastName":"User"}'
```

### 3. Web app

Open:

```text
http://localhost:3000/register
```

## Going forward: schema changes

After local bootstrap, use Prisma migrations for real schema changes.

### 1. Edit the schema

Modify:

```text
apps/api/prisma/schema.prisma
```

### 2. Create a migration locally

```bash
npm run prisma:migrate:dev --workspace apps/api -- --name describe_change
```

Example:

```bash
npm run prisma:migrate:dev --workspace apps/api -- --name add_project_indexes
```

### 3. Commit both

- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/...`

## Deploying schema changes to VPS

On the VPS, use the VPS-local database URL in environment variables, for example:

```env
DIRECT_DATABASE_URL=postgresql://app_user:app_password@localhost:5432/illustrioberdb?schema=public
```

That `localhost` is correct **on the VPS**, because the API and Postgres are on the same server.

### Deploy commands on VPS

```bash
git pull
npm install
npm run prisma:migrate:deploy --workspace apps/api
npm run prisma:generate --workspace apps/api
npm run build --workspace apps/api
```

Then restart the API process using your process manager, for example `pm2`, `systemd`, or Docker.

## Useful troubleshooting commands

### Check Postgres is listening

```bash
lsof -nP -iTCP:5432 -sTCP:LISTEN
pg_isready -h localhost -p 5432
```

### List databases

```bash
psql postgres -c '\l'
```

### List roles

```bash
psql postgres -c '\du'
```

### Check Prisma can reach the DB

```bash
npm run prisma:migrate:status --workspace api
```

### Reset local schema if needed

Only do this against your **local** database:

```bash
npm run prisma:db:push --workspace api -- --force-reset
```

## Security notes

- Never commit real database passwords.
- Never use the production DB for everyday local development.
- Use separate credentials for local and production.
- Rotate any production credential that has ever been pasted into chat or shared in plaintext.
