<!-- generated-by: gsd-doc-writer -->
# Local PostgreSQL + Prisma on WSL2

This guide sets up the Illustriober monorepo for local development on **WSL2 with Ubuntu 24.04**. PostgreSQL runs natively inside Ubuntu; the API uses Prisma and connects over `127.0.0.1:5432`.

Keep local and production data completely separate. Never point local commands, Prisma migrations, or tests at the VPS production database.

## What this setup provides

- PostgreSQL installed through Ubuntu `apt`.
- A non-superuser role named `illustriober_dev`.
- A local database named `illustriober_local`.
- The API on `http://localhost:4000`.
- The Next.js app on `http://localhost:3000`.
- Prisma validation, generation, migration, inspection, and recovery commands.

Docker is not required. An optional Docker alternative appears near the end.

## 1. Confirm the WSL environment

Run inside Ubuntu:

```bash
cat /etc/os-release
uname -a
ps -p 1 -o comm=
```

The last command reports the init system:

- `systemd`: use `systemctl` commands below.
- `init` or another value: use the `service` variants.

From Windows PowerShell, confirm that Ubuntu is using WSL2:

```powershell
wsl --list --verbose
wsl --version
```

## 2. Install PostgreSQL natively

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib postgresql-client
```

Ubuntu creates a default PostgreSQL cluster during package installation. Inspect it without assuming a major version:

```bash
psql --version
pg_lsclusters
```

`pg_lsclusters` should show a cluster named `main`, normally on port `5432`.

## 3. Start PostgreSQL

With systemd:

```bash
sudo systemctl enable --now postgresql
sudo systemctl status postgresql@16-main --no-pager
```

The commands in this guide use Ubuntu 24.04's default `16-main` cluster. If
`pg_lsclusters` reports a different version or cluster name, substitute its
`<version>-<name>` everywhere a `postgresql@16-main` unit appears.

Without systemd:

```bash
sudo service postgresql start
sudo service postgresql status
```

Confirm the cluster and TCP listener:

```bash
pg_lsclusters
pg_isready -h 127.0.0.1 -p 5432
ss -ltnp | grep ':5432'
```

Expected readiness output includes `accepting connections`. This project does not require PostgreSQL to listen on the Windows LAN or public interfaces.

## 4. Create the local role and database

Ubuntu uses peer authentication for local administrative connections. Run administrative commands as the operating-system `postgres` user.

Create an application role and set its password interactively so it does not appear in shell history:

```bash
sudo -u postgres createuser --pwprompt illustriober_dev
```

Use a strong password intended only for local development. Then create the database with that role as owner:

```bash
sudo -u postgres createdb --owner=illustriober_dev illustriober_local
```

Confirm both objects:

```bash
sudo -u postgres psql -c '\du illustriober_dev'
sudo -u postgres psql -c '\l illustriober_local'
```

Test the same TCP/password path the API uses:

```bash
psql -h 127.0.0.1 -p 5432 -U illustriober_dev -d illustriober_local -c 'SELECT current_database(), current_user;'
```

The result should name `illustriober_local` and `illustriober_dev`.

## 5. Configure `apps/api/.env`

From the repository root:

```bash
cp apps/api/.env.example apps/api/.env
nano apps/api/.env
```

Use this shape and replace placeholders locally:

```dotenv
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=replace-with-a-long-random-local-secret
ALLOW_PUBLIC_REGISTRATION=true
RESEND_API_KEY=
DATABASE_URL=postgresql://illustriober_dev:replace-with-url-encoded-local-password@127.0.0.1:5432/illustriober_local?schema=public
DIRECT_DATABASE_URL=
```

Generate a local JWT secret with:

```bash
openssl rand -hex 32
```

Percent-encode any database-password characters that have special meaning in a URL. Keeping `DIRECT_DATABASE_URL` blank makes the Prisma CLI and runtime use `DATABASE_URL`; a non-empty value deliberately overrides it in this repository.

The root and API `.gitignore` files exclude `.env`. Still verify before committing:

```bash
git status --short
git check-ignore -v apps/api/.env
```

Never print, paste, or commit the real `.env` file.

## 6. Install dependencies and bootstrap Prisma

Run from the repository root:

```bash
npm install
npm run prisma:validate --workspace api
npm run prisma:generate --workspace api
```

### Apply the checked-in migration history

The repository contains Prisma migrations. Apply them without creating a new migration:

```bash
npm run prisma:migrate:deploy --workspace api
npm run prisma:migrate:status --workspace api
```

### Fast bootstrap for a disposable database

`db push` synchronizes the schema without adding a migration record. Use it only for a disposable database or while prototyping an uncommitted change:

```bash
npm run prisma:db:push --workspace api
```

Do not use `db push` instead of migrations that must reach other environments.

## 7. Prisma workflow for schema changes

Edit `apps/api/prisma/schema.prisma`, then create and apply a named development migration:

```bash
npm run prisma:migrate:dev --workspace api -- --name describe_the_change
```

For example:

```bash
npm run prisma:migrate:dev --workspace api -- --name add_project_indexes
```

Then verify and regenerate:

```bash
npm run prisma:validate --workspace api
npm run prisma:generate --workspace api
npm run prisma:migrate:status --workspace api
```

Commit these together:

- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/<timestamp>_<name>/migration.sql`

Inspect local data with Prisma Studio:

```bash
npm run prisma:studio --workspace api
```

### Destructive reset warning

`prisma migrate reset`, `dropdb`, `DROP DATABASE`, and restores using `--clean` can delete all local data. Before running one:

1. Confirm the URL names `illustriober_local`, never a production database.
2. Stop the API so it releases connections.
3. Back up anything important.
4. Read the target aloud before confirming.

If a disposable local database truly needs a migration reset:

```bash
cd apps/api
npx prisma migrate reset
cd ../..
```

Do not add `--force` unless data loss is explicitly intended and the target was independently verified.

## 8. Start the application

The most predictable setup uses two terminals from the repository root.

Terminal 1 — API (`tsx watch`, default port `4000`):

```bash
npm run dev --workspace api
```

Terminal 2 — web (`next dev`, default port `3000`):

```bash
npm run dev --workspace web
```

The repository also exposes an all-workspaces command:

```bash
npm run dev
```

That root script dispatches `dev` to workspaces that provide it. Separate terminals remain easier to observe and stop independently for long-running watch processes.

## 9. Verify the running system

PostgreSQL:

```bash
pg_isready -h 127.0.0.1 -p 5432 -d illustriober_local -U illustriober_dev
psql -h 127.0.0.1 -U illustriober_dev -d illustriober_local -c 'SELECT 1;'
```

Prisma reachability:

```bash
npm run prisma:validate --workspace api
npm run prisma:migrate:status --workspace api
```

`validate` checks schema/configuration; `migrate:status` also proves that Prisma can reach the database.

API:

```bash
curl -fsS http://localhost:4000/
curl -fsS http://localhost:4000/health
```

The health route returns `status`, `timestamp`, and `uptime`. It checks the HTTP process but does not query the database, so retain the PostgreSQL and Prisma checks above.

Web:

```bash
curl -I http://localhost:3000
```

Open `http://localhost:3000` or `http://localhost:3000/register` in a browser.

## 10. Day-to-day monitoring

### Service and cluster state

With systemd:

```bash
systemctl is-enabled postgresql
systemctl is-active postgresql@16-main
sudo systemctl status postgresql@16-main --no-pager
```

`postgresql.service` is an umbrella unit on Ubuntu. Its active state does not
prove that the database cluster is running, which is why the cluster unit,
`pg_lsclusters`, and `pg_isready` are checked here.

Without systemd:

```bash
sudo service postgresql status
```

For either setup:

```bash
pg_lsclusters
pg_isready -h 127.0.0.1 -p 5432
```

### Ports, PIDs, and duplicate servers

```bash
ss -ltnp | grep -E ':(3000|4000|5432)\b'
ps -ef | grep -E '[n]ext dev|[t]sx watch|[p]ostgres'
```

For additional detail:

```bash
sudo apt install lsof
sudo lsof -nP -iTCP:3000 -sTCP:LISTEN
sudo lsof -nP -iTCP:4000 -sTCP:LISTEN
sudo lsof -nP -iTCP:5432 -sTCP:LISTEN
```

Stop a foreground development server with `Ctrl+C`. For a confirmed background PID, request graceful termination:

```bash
kill -TERM <pid>
```

Check the port again afterward. Use `kill -KILL <pid>` only as a last resort because it skips cleanup. Do not use `sudo kill` for a process owned by your WSL user.

### PostgreSQL logs

With systemd:

```bash
sudo journalctl -u postgresql@16-main --since '30 minutes ago' --no-pager
sudo journalctl -u postgresql@16-main -f
```

Ubuntu cluster logs are normally also available at:

```bash
sudo tail -n 100 /var/log/postgresql/postgresql-*-main.log
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

Use `Ctrl+C` to leave a live `-f` view.

### Active connections and queries

```bash
sudo -u postgres psql -d illustriober_local -c "
SELECT pid, usename, application_name, client_addr, state,
       now() - backend_start AS connection_age,
       now() - query_start AS query_age,
       left(query, 120) AS query
FROM pg_stat_activity
WHERE datname = current_database()
ORDER BY query_start NULLS LAST;"
```

The API enables Prisma `query`, `warn`, and `error` logging when `NODE_ENV=development`, so its terminal is also a live view of ORM activity.

### Database and table size

```bash
sudo -u postgres psql -d illustriober_local -c "
SELECT current_database() AS database,
       pg_size_pretty(pg_database_size(current_database())) AS size;"
```

```bash
sudo -u postgres psql -d illustriober_local -c "
SELECT schemaname, relname,
       pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 15;"
```

### Long-running queries

This reports active queries running for more than two seconds:

```bash
sudo -u postgres psql -d illustriober_local -c "
SELECT pid, usename, now() - query_start AS duration,
       wait_event_type, wait_event, left(query, 160) AS query
FROM pg_stat_activity
WHERE datname = current_database()
  AND state = 'active'
  AND pid <> pg_backend_pid()
  AND now() - query_start > interval '2 seconds'
ORDER BY duration DESC;"
```

This is a live view, not historical slow-query logging. Historical analysis requires deliberate logging or an extension such as `pg_stat_statements`; broad statement logging can produce large logs and expose sensitive values.

### Blocked and blocking queries

```bash
sudo -u postgres psql -d illustriober_local -c "
SELECT blocked.pid AS blocked_pid,
       now() - blocked.query_start AS blocked_for,
       left(blocked.query, 120) AS blocked_query,
       blocker.pid AS blocker_pid,
       left(blocker.query, 120) AS blocker_query
FROM pg_stat_activity AS blocked
JOIN LATERAL unnest(pg_blocking_pids(blocked.pid)) AS blocking(pid) ON true
JOIN pg_stat_activity AS blocker ON blocker.pid = blocking.pid
WHERE blocked.datname = current_database();"
```

Investigate the application operation before terminating a backend; ending the wrong session can roll back work.

## 11. Troubleshooting

### `DATABASE_URL is not set`

- Confirm `apps/api/.env` exists.
- Start with `npm run dev --workspace api` so package-local Prisma configuration loads the expected environment.
- Confirm the variables exist without printing their values:

```bash
grep -E '^(DATABASE_URL|DIRECT_DATABASE_URL)=' apps/api/.env | sed 's/=.*/=<redacted>/'
```

### `P1001`, connection refused, or `no response`

```bash
pg_lsclusters
pg_isready -h 127.0.0.1 -p 5432
sudo systemctl status postgresql@16-main --no-pager
```

If systemd is unavailable, use `sudo service postgresql status`. Start the service using the matching command in section 3, then rerun:

```bash
npm run prisma:migrate:status --workspace api
```

### Password authentication failed

Confirm the role through TCP:

```bash
psql -h 127.0.0.1 -U illustriober_dev -d illustriober_local
```

To replace its password, run `sudo -u postgres psql`, then:

```sql
\password illustriober_dev
\q
```

Update only the local `.env` afterward and percent-encode URL-sensitive characters.

### Database or role already exists

Inspect instead of dropping anything:

```bash
sudo -u postgres psql -c '\du illustriober_dev'
sudo -u postgres psql -c '\l illustriober_local'
```

### Port `5432` is occupied

```bash
sudo lsof -nP -iTCP:5432 -sTCP:LISTEN
pg_lsclusters
```

Do not start a second instance on the same port. If an optional Docker container owns it, stop the container or deliberately use a different host port and update `DATABASE_URL`.

### `Another next dev server is already running`

Inspect before starting a replacement:

```bash
ps -ef | grep '[n]ext dev'
ss -ltnp | grep ':3000'
```

If it is the desired server, keep using it. Otherwise stop its confirmed PID with `kill -TERM <pid>`. Only after confirming no Next.js process remains should you remove a stale development lock:

```bash
rm -f apps/web/.next/dev/lock
```

The lock removal is safe only when no `next dev` process is running.

### API port `4000` is already in use

```bash
ps -ef | grep '[t]sx watch'
ss -ltnp | grep ':4000'
sudo lsof -nP -iTCP:4000 -sTCP:LISTEN
```

Stop the confirmed old process gracefully instead of starting another copy.

### Next.js reports multiple lockfiles

The repository root `package-lock.json` is the workspace lockfile. An unrelated `package-lock.json` higher in the home directory can make Next.js infer the wrong Turbopack root. Inspect every reported path and remove an extra lockfile only after confirming it does not belong to another project. Do not delete the repository lockfile. If both are intentional, configure the Turbopack root explicitly.

### Schema and migration history disagree

```bash
npm run prisma:validate --workspace api
npm run prisma:migrate:status --workspace api
git status --short apps/api/prisma
```

Do not reset until the URL, migrations, and data at risk have been inspected.

## 12. Restart and WSL shutdown behavior

Restart PostgreSQL with the command appropriate to the init system:

```bash
sudo systemctl restart postgresql@16-main
```

```bash
sudo service postgresql restart
```

Wait for readiness before restarting the API:

```bash
until pg_isready -h 127.0.0.1 -p 5432; do sleep 1; done
npm run dev --workspace api
```

`wsl.exe --shutdown` stops **all running WSL distributions and their processes**, including PostgreSQL, the API, and Next.js. Systemd services do not keep a WSL instance alive. After opening Ubuntu again, verify:

```bash
systemctl is-active postgresql@16-main
pg_isready -h 127.0.0.1 -p 5432
```

If systemd is disabled, PostgreSQL may need `sudo service postgresql start` in each new WSL session.

## 13. Optional systemd auto-start

If `ps -p 1 -o comm=` does not return `systemd`, update WSL from Windows PowerShell:

```powershell
wsl --update
wsl --version
```

Then edit the per-distribution configuration inside Ubuntu:

```bash
sudoedit /etc/wsl.conf
```

Preserve existing sections and add:

```ini
[boot]
systemd=true
```

From Windows PowerShell—not from a shell with unsaved work—restart WSL:

```powershell
wsl.exe --shutdown
```

Open Ubuntu again and enable PostgreSQL:

```bash
ps -p 1 -o comm=
sudo systemctl enable --now postgresql
systemctl is-enabled postgresql
systemctl is-active postgresql@16-main
pg_isready -h 127.0.0.1 -p 5432
```

The enabled service starts when the distro starts; it does not keep WSL alive after `wsl.exe --shutdown` or idle termination.

## 14. Local backups and restores

Keep dumps outside the repository:

```bash
mkdir -p "$HOME/backups/illustriober"
pg_dump -h 127.0.0.1 -U illustriober_dev -d illustriober_local \
  --format=custom \
  --file="$HOME/backups/illustriober/illustriober_local-$(date +%Y%m%d-%H%M%S).dump"
```

Test a backup by restoring into a separate database:

```bash
sudo -u postgres createdb --owner=illustriober_dev illustriober_restore_check
pg_restore -h 127.0.0.1 -U illustriober_dev \
  --dbname=illustriober_restore_check \
  --no-owner \
  "$HOME/backups/illustriober/<backup-file>.dump"
psql -h 127.0.0.1 -U illustriober_dev -d illustriober_restore_check -c '\dt'
```

The next command permanently deletes only the named test database:

```bash
sudo -u postgres dropdb illustriober_restore_check
```

To replace `illustriober_local`, stop the API and verify the backup first. These commands permanently remove the current local contents:

```bash
sudo -u postgres dropdb illustriober_local
sudo -u postgres createdb --owner=illustriober_dev illustriober_local
pg_restore -h 127.0.0.1 -U illustriober_dev \
  --dbname=illustriober_local \
  --no-owner \
  "$HOME/backups/illustriober/<backup-file>.dump"
```

Never restore an untrusted dump or substitute a production database name or URL.

## 15. Optional Docker alternative

Use this only if Docker Desktop is installed and WSL integration is enabled. Native `apt` installation remains the default.

```bash
docker run --name illustriober-postgres \
  -e POSTGRES_USER=illustriober_dev \
  -e POSTGRES_PASSWORD=replace-with-a-local-only-password \
  -e POSTGRES_DB=illustriober_local \
  -p 127.0.0.1:5432:5432 \
  -v illustriober-postgres-data:/var/lib/postgresql/data \
  -d postgres:16
```

```bash
docker ps --filter name=illustriober-postgres
docker logs --tail 100 -f illustriober-postgres
docker exec illustriober-postgres pg_isready -U illustriober_dev -d illustriober_local
```

Do not run native PostgreSQL and this container on host port `5432` simultaneously.

## Security rules

- Keep PostgreSQL bound to localhost; do not set `listen_addresses = '*'`.
- Use the non-superuser `illustriober_dev` role from the application.
- Never reuse production database passwords or JWT secrets locally.
- Never put real secrets in `.env.example`, commits, screenshots, terminal transcripts, or support messages.
- Keep dumps outside the repository and treat them as sensitive.
- Never use the VPS URL for `migrate dev`, `db push`, `migrate reset`, tests, or Prisma Studio.
- Inspect the database name and host before destructive commands without printing the password.
- Back up important local data before schema resets or destructive restores.

## References

- [Microsoft: Use systemd to manage Linux services with WSL](https://learn.microsoft.com/windows/wsl/systemd)
- [Microsoft: Advanced settings configuration in WSL](https://learn.microsoft.com/windows/wsl/wsl-config)
- [Ubuntu Server: Install and configure PostgreSQL](https://documentation.ubuntu.com/server/how-to/databases/install-postgresql/)
- [PostgreSQL: Monitoring database activity](https://www.postgresql.org/docs/current/monitoring-stats.html)
- [PostgreSQL: Viewing locks](https://www.postgresql.org/docs/current/monitoring-locks.html)
