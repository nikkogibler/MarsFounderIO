# Local Development

## Prerequisites

- Node.js v22+
- pnpm v9+ (`npm install -g pnpm`)
- A `.env` file at the repo root (see below)

## Environment Setup

Create `.env` at the repo root:

```env
DATABASE_URL=postgresql://...   # Neon connection string
OPENROUTER_API_KEY=sk-or-...    # OpenRouter API key
```

## Running the API Server

```bash
cd /path/to/MarsFounderIO
export $(grep -v '^#' .env | xargs) && PORT=3000 pnpm --filter @workspace/api-server run dev
```

The API starts at `http://localhost:3000`. Changes hot-reload via `tsx watch`.

Verify it's up:
```bash
curl http://localhost:3000/api/healthz
# {"status":"ok"}
```

## Running the Frontend

In a separate terminal:

```bash
cd artifacts/marsfounder
PORT=5173 BASE_PATH=/ pnpm run dev
```

The SPA starts at `http://localhost:5173`. Vite proxies `/api/*` requests to `localhost:3000` automatically — no `VITE_API_URL` needed locally.

## Running Both (summary)

**Terminal 1 — API:**
```bash
export $(grep -v '^#' .env | xargs) && PORT=3000 pnpm --filter @workspace/api-server run dev
```

**Terminal 2 — Frontend:**
```bash
cd artifacts/marsfounder && PORT=5173 BASE_PATH=/ pnpm run dev
```

## Code Generation (API client + Zod schemas)

After modifying `lib/api-spec/openapi.yaml`:

```bash
pnpm --filter @workspace/api-spec run generate
```

This regenerates:
- `lib/api-client-react/src/generated/` — TanStack Query hooks
- `lib/api-zod/src/generated/` — Zod validators

## Database Migrations

Drizzle is configured at `lib/db/drizzle.config.ts`.

```bash
# Generate a migration from schema changes
pnpm --filter @workspace/db run db:generate

# Apply migrations
pnpm --filter @workspace/db run db:migrate

# Open Drizzle Studio (DB GUI)
pnpm --filter @workspace/db run db:studio
```

## Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

# Add a dep to a specific package
pnpm --filter @workspace/marsfounder add <package>
pnpm --filter @workspace/api-server add <package>
```

## Workspace Package Names

Use these with `--filter` for targeted commands:

| Directory | Filter name |
|-----------|------------|
| `artifacts/marsfounder` | `@workspace/marsfounder` |
| `artifacts/api-server` | `@workspace/api-server` |
| `lib/db` | `@workspace/db` |
| `lib/api-spec` | `@workspace/api-spec` |
| `lib/api-client-react` | `@workspace/api-client-react` |
| `lib/api-zod` | `@workspace/api-zod` |
| `lib/integrations-anthropic-ai` | `@workspace/integrations-anthropic-ai` |

## TypeScript

The root `tsconfig.json` extends `tsconfig.base.json`. Each package has its own `tsconfig.json` that references the base. Build all:

```bash
pnpm -r run build
```
