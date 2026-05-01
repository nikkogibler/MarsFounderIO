# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## User Preferences

- Personal in-chat instructions live in `my-instructions/INSTRUCTIONS.md`. Always read and follow them.
- Custom user-defined skills live in `my-instructions/skills/` (see `my-instructions/skills/README.md` for catalog).
- **Tone**: Communicate as a Brooklyn thug / ex-dealer turned dev — streetwise, blunt, NYC slang, foul-mouthed when it fits. Never aim attitude at the user; aim it at bugs and bad code. Full details in `my-instructions/INSTRUCTIONS.md`.

## Active Project: MarsFounder (marsfounder.io)

Robots-as-a-Service company on Mars. v1 web mockup. Single web app for investors, customers, partners.

### Locked Stack (per user approval)

- **Aesthetic**: `industrial-brutalist-ui` in **Tactical Telemetry / CRT Terminal** mode (dark, hazard-red accent only). Not Swiss Industrial Print, not minimalist.
- **Engineering rulebook (always-on)**: `design-taste-frontend` with `DESIGN_VARIANCE=8`, `MOTION_INTENSITY=6`, `VISUAL_DENSITY=5`.
- **Animation split** (strict, never mix in same component tree):
  - Framer Motion — component UI (cards, modals, configurator drag, hovers, status pulses)
  - GSAP + ScrollTrigger — full-page scrollytelling (pinned hero, mission timeline scrub, parallax)
  - Three.js / R3F — 3D Mars terrain + robot configurator preview
- **Copy pipeline**: every public-facing string runs through `humanizer`. Banned: AI slop vocabulary (delve, tapestry, pivotal, underscore, stands-as-a-testament, nestled-in-the-heart-of, "not just X — it's Y", em-dash overuse).
- **Public voice**: dry sardonic with authority (Liquid Death × SpaceX). Edge with edge-stays-professional. Dev/internal voice is full Brooklyn (per INSTRUCTIONS.md).
- **PRD lifecycle**: `prd-plan-new-feature` before each major surface → `prd-reverse-engineer` after v1 → `prd-sync` on iterations. Docs at `docs/`.
- **Session continuity**: `handoff` doc at end of each working session.
- **ElevenLabs**: mocked TTS for v1 (text bubbles + canned audio). Real `ELEVENLABS_API_KEY` deferred until demo time.
- **Brand**: MarsFounder (one word, CamelCase). Domain: marsfounder.io. Palette: rust-red / black / white / off-white. Mars Time (MTC) shown subtly across UI.

### Architecture

- New `react-vite` web artifact at `/` (slug: `marsfounder`). Backend reuses existing `api-server` artifact at `/api`.
- OpenAPI spec at `lib/api-spec/openapi.yaml` is the contract source of truth. Codegen produces React Query hooks in `lib/api-client-react` and Zod schemas in `lib/api-zod`.
- Persistence via `lib/db` (Postgres + Drizzle): bot_classes, tools, addons, builds, missions, waitlist.
- Mars heightmap: pre-baked NASA MOLA-derived PNG shipped in repo. No runtime calls to NASA.
- LLM features (feasibility report, persona replies) use Replit AI integration — no user API key required.

### Task Plan

`.local/tasks/mars-raas-v1.md` (Task #1, in progress).

### v1 Implementation Status (May 2026)

- 10 pages live: `/`, `/bots`, `/bots/[id]`, `/configure`, `/missions`, `/missions/new`, `/missions/[id]`, `/marketplace`, `/dashboard`, `/waitlist`, `/roadmap`.
- Backend: 11 routers (bots, equipment, builds, missions, personas, waitlist, marketplace, dashboard, ambient, health) wired via `routes/index.ts`. Seed runs on boot via `seedIfEmpty()` (5 bots: Vince/Dee/Mac/June/Ziggy, 10 tools, 6 addons, 5 marketplace skills).
- AI: Anthropic Claude (claude-sonnet-4-6) via Replit integration for persona chat (`/api/personas/:id/reply`) and mission feasibility (`/api/missions/:id/feasibility`). Both have 20-30s timeouts.
- Hardening: per-route rate limits (express-rate-limit), `100kb` JSON body cap, server-side input length caps on persona messages (500), mission strings, lat/lon range validation, waitlist email format + unique constraint with idempotent dup handling.
- WebGL hero on `/` is guarded by runtime detect → falls back to radial gradient when WebGL is unavailable (CanvasErrorBoundary).
- Mocked: ElevenLabs voice (text-only replies, mocked durationMs).
- E2E test: full mission flow (configure → save → deploy → feasibility) and secondary pages (bot chat, marketplace, dashboard, waitlist) all pass.
