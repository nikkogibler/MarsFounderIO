# Deployment

## Infrastructure

| Layer | Host | URL |
|-------|------|-----|
| Frontend (SPA) | Vercel | `https://marsfounder-io.vercel.app` |
| API Server | Hostinger VPS (Docker) | `http://145.14.157.203:3000` |
| Database | Neon serverless PostgreSQL | (connection string in `DATABASE_URL`) |
| AI | OpenRouter | `https://openrouter.ai/api/v1` |

---

## Frontend — Vercel

### Config (`vercel.json`)
```json
{
  "buildCommand": "pnpm --filter @workspace/marsfounder run build",
  "outputDirectory": "artifacts/marsfounder/dist/public",
  "installCommand": "pnpm install",
  "framework": null,
  "rewrites": [
    { "source": "/api/:path*", "destination": "http://145.14.157.203:3000/api/:path*" },
    { "source": "/((?!assets/).*)", "destination": "/index.html" }
  ]
}
```

### Production behavior

- The frontend should use relative `/api/*` requests in production.
- Vercel proxies those requests to the VPS via the rewrite above.
- `VITE_API_URL` should be left unset in Vercel for production unless the API is served over HTTPS directly.

### Redeploy
Push to `main` — Vercel auto-deploys. Manual redeploy available in Vercel dashboard.

---

## API Server — Hostinger VPS

### Server details
- **IP**: `145.14.157.203`
- **Port**: `3000` (publicly accessible, no firewall rule needed)
- **App directory**: `/opt/marsfounder`
- **Container name**: `marsfounder-api`

### Required env vars

| Variable | Description |
|----------|-------------|
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Neon connection string |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `CORS_ORIGIN` | Comma-separated allowed origins (e.g. `https://marsfounder-io.vercel.app`) |

### Redeploy after code changes

Run in the Hostinger browser terminal:

```bash
cd /opt/marsfounder
git pull

# One-time setup if the env file does not exist yet
cat > /root/marsfounder.env <<'EOF'
PORT=3000
NODE_ENV=production
DATABASE_URL=<neon_connection_string>
OPENROUTER_API_KEY=<openrouter_key>
CORS_ORIGIN=https://marsfounder-io.vercel.app
EOF

docker build -t marsfounder-api .
docker stop marsfounder-api
docker rm marsfounder-api
docker run -d --name marsfounder-api --restart unless-stopped \
  -p 3000:3000 \
  --env-file /root/marsfounder.env \
  marsfounder-api
```

### Verify the container is healthy

```bash
# Container running
docker ps | grep marsfounder-api

# Health check
curl http://localhost:3000/api/healthz
# Expected: {"status":"ok"}

# Check env vars are set
docker exec marsfounder-api env | grep -E 'DATABASE_URL|OPENROUTER_API_KEY|CORS_ORIGIN'

# View logs
docker logs marsfounder-api --tail 50
```

---

## Docker Build

The `Dockerfile` at the repo root is a multi-stage build:

1. **Builder stage** (`node:22-alpine`): installs pnpm via corepack, installs all workspace deps with `--frozen-lockfile`, runs `pnpm --filter @workspace/api-server run build` (esbuild → `dist/`)
2. **Runtime stage** (`node:22-alpine`): copies `dist/` and `node_modules/` from builder, exposes port 3000, runs `node --enable-source-maps ./dist/index.mjs`

The `.dockerignore` excludes: `node_modules`, `.env*`, `dist`, `artifacts/marsfounder`, `mockup-sandbox`, `scripts`, `attached_assets`, `my-instructions`.

---

## Adding a Custom Domain

When a custom domain (e.g. `marsfounder.io`) is pointed to Vercel:

1. Update `CORS_ORIGIN` on the VPS to include the new domain:
   ```
   https://marsfounder.io,https://www.marsfounder.io
   ```
2. Restart the container with the updated `CORS_ORIGIN` value (use the redeploy command above).
3. If you later move the API behind its own HTTPS domain, you can keep using the Vercel proxy or intentionally reintroduce `VITE_API_URL` with the HTTPS endpoint.
