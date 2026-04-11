# [Goal Description]

**Status (April 2026):** Auto-deploy for the VPS-hosted API via GitHub Actions on `main` is implemented (see `.github/workflows/deploy-vps.yml`). API dev runtime uses `tsx` per `ai-spec/errorhistory.md` (ESM resolution). Treat the sections below as the original design notes and secret checklist.

Analyze the current state of the infrastructure setup for Illustriober Creatives and implement an automated deployment system ("auto-deploy") for the VPS-hosted API, triggered by GitHub pushes. This will complete the setup by ensuring the server automatically pulls, builds, and restarts on every update to the `main` branch.

## User Review Required

> [!IMPORTANT]
> To enable the GitHub Action, you will need to add three secrets to your GitHub repository (**Settings > Secrets and variables > Actions**):
> 1. `VPS_HOST`: The IP address of your VPS (`156.232.88.133`)
> 2. `VPS_USER`: The SSH username (`itsriober`)
> 3. `VPS_SSH_KEY`: The **private key** corresponding to the public key already on your server.

> [!WARNING]
> We will be switching `apps/api` from **ESM** to **CommonJS**. This is the recommended fix in your log to resolve the `ERR_MODULE_NOT_FOUND` error quickly without rewriting all import paths in the codebase.

## Proposed Changes

### [Component] API (apps/api)
Fix the ESM module resolution error by reverting to CommonJS, which is more stable for this Express + Prisma setup.

#### [MODIFY] [package.json](file:///Users/apple/Claude/Personal/illustriober-cr/apps/api/package.json)
- Remove `"type": "module"` to signal CommonJS mode.

#### [MODIFY] [tsconfig.json](file:///Users/apple/Claude/Personal/illustriober-cr/apps/api/tsconfig.json)
- Change `"module": "ESNext"` to `"module": "CommonJS"`.
- Ensure `"moduleResolution": "node"` is set.

---

### [Component] Automation
Implement the GitHub Action that handles the "auto-deploy" logic.

#### [NEW] [deploy-vps.yml](file:///Users/apple/Claude/Personal/illustriober-cr/.github/workflows/deploy-vps.yml)
- Create a workflow that triggers on push to `main`.
- Step 1: SSH into the VPS.
- Step 2: `cd /var/www/illustriober`.
- Step 3: `git pull origin main`.
- Step 4: `npm install` (root and workspaces).
- Step 5: `npm run build --workspace apps/api`.
- Step 6: `pm2 restart illustriober-api`.

---

### [Component] Documentation

#### [MODIFY] [illustriober-setup-log.md](file:///Users/apple/Claude/Personal/illustriober-cr/ai-spec/illustriober-setup-log.md)
- Mark the ESM error as resolved.
- Record the addition of the auto-deployment workflow.

## Open Questions

> [!IMPORTANT]
> 1. Do you have the `ed25519` private key for the `itsriober` user handy to add to GitHub secrets?
> 2. Is there any specific branch other than `main` that you want to trigger auto-deploys for?

## Verification Plan

### Automated Tests
- I will run `npm run build --workspace apps/api` locally to verify that the CommonJS switch fixes the compilation issues.
- I will use the `github-actions-templates` skill to validate the `.github/workflows/deploy-vps.yml` syntax.

### Manual Verification
- After we push the changes, we will check the **Actions** tab on GitHub to see the deployment running.
- We will verify the API is live by checking the `/health` endpoint (once Nginx is configured in the next phase).
