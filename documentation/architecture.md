# Architecture

## Overview

MarsFounder.io is a monorepo (pnpm workspaces) with a React SPA frontend deployed on Vercel and an Express API server deployed on a Hostinger VPS via Docker. The database is Neon (serverless PostgreSQL). AI features use OpenRouter.

```
Browser → Vercel (SPA) → VPS Docker container (Express API) → Neon PostgreSQL
                                                             → OpenRouter (AI)
```

## Monorepo Structure

```
/
├── artifacts/
│   ├── marsfounder/          # React SPA (Vite, Tailwind v4, Shadcn UI)
│   └── api-server/           # Express 5 API (TypeScript, esbuild CJS bundle)
├── lib/
│   ├── db/                   # Drizzle ORM schema + client (@workspace/db)
│   ├── api-spec/             # OpenAPI spec + Orval codegen config
│   ├── api-client-react/     # Generated React Query hooks
│   ├── api-zod/              # Generated Zod validators
│   └── integrations-anthropic-ai/  # OpenRouter client (openai SDK)
├── vercel.json               # Vercel build config (frontend only)
├── Dockerfile                # Multi-stage Docker build (API only)
└── .dockerignore
```

## Package Names (workspace references)

| Path | Package name |
|------|-------------|
| `artifacts/marsfounder` | `@workspace/marsfounder` |
| `artifacts/api-server` | `@workspace/api-server` |
| `lib/db` | `@workspace/db` |
| `lib/api-spec` | `@workspace/api-spec` |
| `lib/api-client-react` | `@workspace/api-client-react` |
| `lib/api-zod` | `@workspace/api-zod` |
| `lib/integrations-anthropic-ai` | `@workspace/integrations-anthropic-ai` |

## Frontend (`artifacts/marsfounder`)

- **Framework**: React 18, Vite 7
- **Styling**: Tailwind CSS v4, Shadcn UI (Radix primitives)
- **Routing**: Wouter
- **Data fetching**: TanStack Query v5 + generated hooks from `@workspace/api-client-react`
- **Animation**: Framer Motion, GSAP, Three.js (React Three Fiber)
- **API base URL**: Set at boot via `setBaseUrl(import.meta.env.VITE_API_URL)` in `src/main.tsx`. In dev, if unset, Vite proxies `/api` to `localhost:3000`.

## API Server (`artifacts/api-server`)

- **Framework**: Express 5, TypeScript
- **Build**: esbuild → single CJS bundle at `dist/index.mjs`
- **Database access**: Drizzle ORM via `@workspace/db`
- **AI**: `@workspace/integrations-anthropic-ai` (OpenRouter via `openai` SDK, model `deepseek/deepseek-v4-flash`)
- **Rate limiting**: 
  - AI routes (`/api/personas/*`, `/api/missions/:id/feasibility`): 15 req/min
  - Write routes (`POST /api/builds`, `POST /api/missions`): 30 req/min
  - Waitlist: 5 req/10 min
- **CORS**: Controlled via `CORS_ORIGIN` env var (comma-separated origins). If unset, all origins are allowed (dev mode).
- **Logging**: Pino + pino-http

## Database (`lib/db`)

ORM: Drizzle ORM. Provider: Neon serverless PostgreSQL.

### Tables

| Table | Key columns |
|-------|-------------|
| `bot_classes` | `id` (text PK), `codename`, `role`, `hourly_credits`, `tool_slots`, `addon_slots`, persona fields |
| `builds` | `id` (uuid), `bot_class_id`, `tool_ids` (array), `addon_ids` (array), `founder_handle`, timestamps |
| `missions` | `id` (uuid), `build_id`, `objective`, `duration_sols`, `location_name`, `lat/lon`, `status`, `progress_percent` |
| `waitlist` | `id` (uuid), `email` (unique), `role`, `company`, `notes` |

Static/seed tables (tools, addons) are seeded via `lib/db/src/schema/tools.ts` and `addons.ts`.

## AI Integration

File: `lib/integrations-anthropic-ai/src/client.ts`

Uses the `openai` SDK pointed at OpenRouter:
- `baseURL`: `https://openrouter.ai/api/v1`
- Model: `deepseek/deepseek-v4-flash`
- Headers: `HTTP-Referer`, `X-Title`
- Env var: `OPENROUTER_API_KEY`

Used by:
- `POST /api/personas/:botId/reply` — AI persona chat
- `POST /api/missions/:missionId/feasibility` — mission feasibility analysis

## Code Generation

The OpenAPI spec lives at `lib/api-spec/openapi.yaml`. Orval generates:
- `lib/api-client-react/src/generated/` — React Query hooks
- `lib/api-zod/src/generated/` — Zod schemas

After changing the spec, regenerate with:
```bash
pnpm --filter @workspace/api-spec run generate
```
