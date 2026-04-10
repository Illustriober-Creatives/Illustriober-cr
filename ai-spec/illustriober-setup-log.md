# Illustriober Creatives — Infrastructure Setup Log
**Date:** April 10, 2026  
**Author:** Justine Harmon (Itsriober)  
**Document Purpose:** Full record of infrastructure decisions, completed steps, current state, and next actions.

---

## 1. Project Overview

**Illustriober Creatives** is a Nairobi-based personal studio platform covering:
- Full-stack web & mobile development
- UI/UX and graphic design
- Cloud deployment & DevOps
- Client project delivery

**Repository:** `github.com/Illustriober-Creatives/Illustriober-cr`  
**Org owner account:** `Itsriober` (personal GitHub account, also admin on the repo)

---

## 2. Infrastructure Decisions

### Architecture

| Layer | Platform | Status |
|---|---|---|
| Frontend (Next.js) | Vercel | Pending deployment |
| API (Express + Prisma) | VPS | Running, ESM error blocking |
| Database (PostgreSQL 15) | VPS | Running |
| DNS Management | Cloudflare | Propagating |
| Domain Registrar | Truehost | Nameservers updated |

### Why This Split
- Vercel handles all static/SSR frontend work — CDN, edge, preview URLs per branch
- VPS handles only server-side: Express API, PostgreSQL, background/cron jobs
- No Next.js on the VPS — removes build load and memory pressure from the 1 vCPU / 2 GB box

### VPS Specs
| Parameter | Value |
|---|---|
| Provider | Truehost Cloud |
| Plan | Cloud VPS 1 |
| Price | $5.66/month |
| vCPU | 1 Core |
| RAM | 2 GB |
| Storage | 50 GB SSD |
| Transfer | 1 TB/month |
| Location | Europe/USA |
| Main IP | 156.232.88.133 |
| OS | Ubuntu 22.04 LTS x86_64 |
| Management | Unmanaged |

### Domain
| Item | Value |
|---|---|
| Domain | illustriober.com |
| Registrar | Truehost |
| DNS Provider | Cloudflare (free) |
| Nameservers | Updated on Truehost → pointing to Cloudflare |

---

## 3. Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Express, TypeScript, Prisma |
| Database | PostgreSQL 15 |
| ORM | Prisma |
| Monorepo | npm workspaces |
| Node requirement | Node.js 20+ |
| Process manager | PM2 |
| Web server | Nginx (reverse proxy) |
| SSL | Certbot (Let's Encrypt) |

### Monorepo Structure
```
illustriober-cr/
├── apps/
│   ├── web/       # Next.js frontend → deployed to Vercel
│   └── api/       # Express + Prisma → deployed to VPS
├── packages/
│   └── shared/    # Shared types/schemas
├── ai-spec/       # Product and architecture specs
└── package.json   # Root workspace scripts
```

---

## 4. Completed Steps

### VPS
- [x] Purchased Cloud VPS 1 from Truehost ($5.66/month)
- [x] Selected OS: Ubuntu 22.04 LTS x86_64
- [x] SSH'd into server as root
- [x] Ran `apt update && apt upgrade -y`
- [x] Created non-root user: `itsriober`
- [x] Added `itsriober` to sudo group
- [x] Generated SSH key on VPS (`ed25519`, label: `illustriober-vps`)
- [x] Added VPS public key to GitHub (personal account: `Itsriober`)
- [x] Granted `Itsriober` admin access to `Illustriober-Creatives/Illustriober-cr` repo
- [x] Fixed `/var/www` ownership: `sudo chown -R itsriober:itsriober /var/www`
- [x] Cloned repo to `/var/www/illustriober`
- [x] Installed Node.js 20 via nvm
- [x] Installed PostgreSQL 15
- [x] Created database user `illustriober` and database `illustriober`
- [x] Installed Nginx
- [x] Installed PM2
- [x] Created `apps/api/.env` with production values
- [x] Ran Prisma generate and migrate
- [x] Built API: `npm run build --workspace apps/api`
- [x] Started API with PM2: `pm2 start apps/api/dist/index.js --name illustriober-api`
- [x] Configured UFW firewall (ports 22, 80, 443 open)

### DNS / Domain
- [x] Purchased domain `illustriober.com` on Truehost
- [x] Added domain to Cloudflare (free plan)
- [x] Added DNS record: `api` A record → `156.232.88.133` (DNS only, gray cloud)
- [x] Updated nameservers on Truehost → Cloudflare nameservers
- [ ] Nameserver propagation in progress (15min – 24hrs)

### GitHub
- [x] Repo transferred to `Illustriober-Creatives` org
- [x] `Itsriober` added as admin collaborator on the repo

---

## 5. Current Blocker

### RESOLVED: ESM Module Error in API Build

**Fix Applied:** We changed `"module": "ESNext"` to `"module": "CommonJS"` in `apps/api/tsconfig.json` and removed `"type": "module"` from `apps/api/package.json`. Additionally, all relative `.js` extension path imports were removed. The API now correctly builds and runs as a CommonJS project.

---

## 6. Current State Summary

| Component | State |
|---|---|
| VPS provisioned | ✅ Done |
| SSH access (Mac) | ✅ Done |
| PostgreSQL running | ✅ Done |
| Nginx installed | ✅ Done |
| API built | ✅ Done |
| API running (PM2) | ✅ Done — ESM error resolved |
| DNS propagating | 🟡 In progress |
| Nginx config for api subdomain | ⏳ Pending (after DNS) |
| SSL via Certbot | ⏳ Pending (after DNS) |
| Vercel deployment | ⏳ Pending (after API is live on HTTPS) |
| illustriober.com on Vercel | ⏳ Pending (after Vercel deploy) |
| Home PC SSH key added | ⏳ Pending |

---

## 7. Remaining Steps (In Order)

### Step 1 — Auto Deploy Setup (Completed)
Configured GitHub Actions (`.github/workflows/deploy-vps.yml`) to automatically connect to VPS via SSH on pushes to `main` and execute the pull, build, and restart sequence.

**Required Action:** Ensure GitHub Secrets `VPS_HOST`, `VPS_USER`, and `VPS_SSH_KEY` are populated.
### Step 2 — Configure Nginx for api subdomain
Once DNS has propagated and API is responding on localhost:

```bash
sudo nano /etc/nginx/sites-available/illustriober-api
```
Config:
```nginx
server {
    listen 80;
    server_name api.illustriober.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable:
```bash
sudo ln -s /etc/nginx/sites-available/illustriober-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 3 — SSL for api.illustriober.com
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.illustriober.com
sudo certbot renew --dry-run
```

### Step 4 — Deploy to Vercel
- Go to vercel.com → New Project
- Import `Illustriober-Creatives/Illustriober-cr`
- Set Root Directory: `apps/web`
- Add environment variable: `NEXT_PUBLIC_API_URL=https://api.illustriober.com`
- Deploy

### Step 5 — Add domain to Vercel
- Vercel project → Settings → Domains
- Add `illustriober.com` and `www.illustriober.com`
- Add to Cloudflare DNS:

```
Type: A     | Name: @   | Value: 76.76.21.21        | Proxy: Proxied
Type: CNAME | Name: www | Value: cname.vercel-dns.com | Proxy: Proxied
```

### Step 6 — Add Home PC SSH key
```bash
# On home PC — generate key
ssh-keygen -t ed25519 -C "harmon-homepc"
cat ~/.ssh/id_ed25519.pub

# On server — add the key
nano ~/.ssh/authorized_keys
# Paste home PC public key on a new line
```

---

## 8. Client Project Subdomains (Planned)

For future client project hosting/previews:

| Approach | Use Case | How |
|---|---|---|
| `eternity.illustriober.com` | Standalone client site deployment | Add CNAME in Cloudflare → Vercel project custom domain |
| `illustriober.com/eternity` | Portfolio case study / preview page | Next.js route within main app |
| Vercel preview URLs | Development previews for client review | Auto-generated per branch by Vercel — no DNS needed |

Vercel auto-generates preview URLs per branch:
```
eternity-git-main-illustriober.vercel.app
```
Use these for client review during development. Promote to subdomain only when ready for production.

---

## 9. Server Access Reference

### SSH (Mac)
```bash
ssh illustriober
# resolves via ~/.ssh/config alias
```

### SSH Config (Mac — `~/.ssh/config`)
```
Host illustriober
    HostName 156.232.88.133
    User itsriober
    IdentityFile ~/.ssh/id_ed25519
```

### Key PM2 Commands
```bash
pm2 status                          # Check all processes
pm2 logs illustriober-api           # Tail logs
pm2 restart illustriober-api        # Restart API
pm2 save                            # Save process list
```

### Key Paths on Server
```
/var/www/illustriober/              # Project root
/var/www/illustriober/apps/api/     # Express API
/etc/nginx/sites-available/         # Nginx configs
/home/itsriober/.pm2/logs/          # PM2 logs
```

---

## 10. Does Nameserver Propagation Block Anything?

**No — it does not block the ESM fix or API repair.**

Propagation only affects:
- `api.illustriober.com` resolving publicly (needed for Certbot SSL)
- `illustriober.com` routing to Vercel

You can fix the ESM error, get the API running on `localhost:4000`, and configure Nginx right now. Only Certbot (Step 3) requires DNS to be fully propagated before it will work.

Check propagation status at: `https://dnschecker.org/#A/api.illustriober.com`
