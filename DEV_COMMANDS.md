# Illustriober Monorepo Dev Commands

Quick command reference for this project (`apps/web` + `apps/api`).

## 1) Install dependencies

```bash
npm install
```

Installs dependencies for all workspaces.

## 2) Run the project in development

### Run everything (web + api)

```bash
npm run dev
```

Runs all workspace `dev` scripts.

### Run only the Next.js web app

```bash
npm run dev --workspace apps/web
```

- Opens at: `http://localhost:3000`
- Visual pages:
  - `/`
  - `/about`
  - `/services`
  - `/work`
  - `/tech-stack`
  - `/enquiry`

### Run only the API

```bash
npm run dev --workspace apps/api
```

- API base URL: `http://localhost:4000`
- Useful endpoints:
  - `GET /`
  - `GET /health`
  - `POST /api/enquiries`
  - `POST /api/auth/*`

## 3) Build and start (production mode)

### Build all workspaces

```bash
npm run build
```

### Build only web

```bash
npm run build --workspace apps/web
```

### Start web in production

```bash
npm run start --workspace apps/web
```

### Build + start API in production

```bash
npm run build --workspace apps/api
npm run start --workspace apps/api
```

## 4) Lint

### Lint all

```bash
npm run lint
```

### Lint only web

```bash
npm run lint --workspace apps/web
```

## 5) Prisma commands (API)

```bash
npm run prisma:validate --workspace apps/api
npm run prisma:generate --workspace apps/api
npm run prisma:migrate --workspace apps/api
```

Use these when schema/database changes are involved.

## 6) Check running ports (macOS)

### Check a specific port

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
lsof -nP -iTCP:4000 -sTCP:LISTEN
```

### Check all listening ports (filter)

```bash
lsof -nP -iTCP -sTCP:LISTEN | rg '3000|4000'
```

## 7) Stop/close a port process

### Graceful stop by PID

```bash
kill -15 <PID>
```

### Force stop if needed

```bash
kill -9 <PID>
```

### One-liner to close a port

```bash
kill -15 $(lsof -ti :3000)
kill -15 $(lsof -ti :4000)
```

If no process is on that port, the command may show a shell error; that is normal.

## 8) Quick health checks

### API health

```bash
curl -i http://localhost:4000/health
```

### API root info

```bash
curl -i http://localhost:4000/
```

### Web app HTTP check

```bash
curl -I http://localhost:3000/
```

## 9) Stop running dev servers

If running in the current terminal:

```bash
Ctrl + C
```

If running in another terminal/session, kill by port using section 7.

## 10) Notes for this repo

- Web app runs on `3000` by default.
- API runs on `4000` by default.
- Web rewrite/proxy forwards `/api/*` to API `:4000`.
- There is currently no `test` script configured in workspace `package.json` files.
