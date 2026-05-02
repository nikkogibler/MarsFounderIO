# MarsFounder.io

**The robotic-first Mars pre-deployment platform.**

[![CI](https://github.com/nikkogibler/MarsFounderIO/actions/workflows/ci.yml/badge.svg)](https://github.com/nikkogibler/MarsFounderIO/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> Deploy robotic fleets to Mars, configure missions, and build the infrastructure for a Turnkey Civilization — before humans ever set foot on the surface.

🌐 **Live:** [marsfounder-io.vercel.app](https://marsfounder-io.vercel.app)  
📖 **Docs:** [documentation/](documentation/)  
🤝 **Contributions welcome:** [CONTRIBUTING.md](CONTRIBUTING.md)  
🛡 **Security:** [SECURITY.md](SECURITY.md)  
📜 **Code of conduct:** [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

---

## What is this?

MarsFounder.io is a mission control and ecosystem management platform built around a **Robots-First Doctrine**: autonomous robotic pre-deployment is the fastest path to a sustainable Mars civilization. This platform lets founders plan, configure, and track robotic missions — treating Martian surface operations as a product, not a science project.

The core philosophy, drawn from the **"Robotic Mars Pre-Deployment Program Projection"**, is that biological vulnerability is the primary bottleneck in planetary colonization. The 50-year strategic window before human arrival should be used to build a complete planetary network of power, compute, and life-support infrastructure: a "Turnkey Civilization" that awaits human arrival as a finished utility.

---

## Why Contribute?

- **Interesting product surface** — frontend UX, API design, AI-assisted workflows, data modeling, and mission simulation all meet in one repo
- **Real contributor leverage** — the codebase is still early enough that a single good PR can meaningfully shape the product
- **Clear technical seams** — frontend, API, schema, generated clients, docs, and deployment are split into understandable workspace packages
- **Plenty of open problems** — testing, API completeness, mission logic, telemetry realism, UI polish, and contributor tooling all have room to improve

---

## Features

- **Mission Builder** — configure objectives, location, duration, and bot loadout before committing an asset to the surface
- **Robotic Fleet Management** — browse bot classes by role, spec, and hourly credit burn; build custom loadouts with tools and add-ons
- **AI Personas** — each bot class has a named AI persona; chat with your fleet commander before a mission
- **Mission Feasibility Analysis** — AI-powered analysis flags risks before you deploy
- **Skill Marketplace** — modular software payloads for robotic hardware
- **Ambient Telemetry** — live Mars Sol Date, Earth–Mars light delay, and dust storm alerts
- **Dashboard** — mission counts, build overview, and live telemetry summary

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 7, Tailwind CSS v4, Shadcn UI, Framer Motion, GSAP, Three.js |
| Backend | Express 5, TypeScript, esbuild |
| Database | Drizzle ORM + Neon (serverless PostgreSQL) |
| AI | OpenRouter (`deepseek/deepseek-v4-flash`) |
| Hosting | Vercel (frontend) + Hostinger VPS / Docker (API) |
| Monorepo | pnpm workspaces |

---

## Project Structure

```
├── artifacts/
│   ├── marsfounder/      # React SPA (frontend)
│   └── api-server/       # Express API server
├── lib/
│   ├── db/               # Drizzle ORM schema + client
│   ├── api-spec/         # OpenAPI spec + Orval codegen
│   ├── api-client-react/ # Generated TanStack Query hooks
│   └── api-zod/          # Generated Zod validators
├── documentation/        # Architecture, API reference, deployment, local dev
├── vercel.json           # Vercel build config (frontend)
└── Dockerfile            # Multi-stage Docker build (API)
```

Full documentation: [documentation/architecture.md](documentation/architecture.md)

---

## Getting Started

### Prerequisites
* Node.js v22+
* pnpm (`npm install -g pnpm`)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env` file at the repo root with:
   ```
   DATABASE_URL=<your Neon connection string>
   OPENROUTER_API_KEY=<your OpenRouter key>
   ```
4. Push the database schema:
   ```bash
   export $(grep -v '^#' .env | xargs) && pnpm --filter @workspace/db run push
   ```

### Running locally
**API server** (terminal 1):
```bash
export $(grep -v '^#' .env | xargs) && PORT=3000 pnpm --filter @workspace/api-server run dev
```

**Frontend** (terminal 2):
```bash
cd artifacts/marsfounder && PORT=5173 BASE_PATH=/ pnpm run dev
```

Frontend runs at `http://localhost:5173`. The Vite proxy forwards `/api/*` calls to `localhost:3000`.

---

## Deployment

### Architecture
```
Browser → Vercel (static frontend) → Hostinger VPS (Express API, Docker) → Neon (PostgreSQL)
```

### Frontend — Vercel
- Build command (auto-detected from `vercel.json`): `pnpm --filter @workspace/marsfounder run build`
- Output: `artifacts/marsfounder/dist/public`
- Production requests use relative `/api/*` URLs.
- `vercel.json` proxies `/api/:path*` to the VPS API, so `VITE_API_URL` should remain unset in production unless you intentionally serve the API over HTTPS directly.

### API Server — Hostinger VPS (Docker)
The repo includes a `Dockerfile` at the root. To deploy or redeploy on the VPS:

```bash
# First time
git clone https://github.com/nikkogibler/MarsFounderIO.git /opt/marsfounder
cd /opt/marsfounder

cat > /root/marsfounder.env <<'EOF'
PORT=3000
NODE_ENV=production
DATABASE_URL=<your Neon connection string>
OPENROUTER_API_KEY=<your OpenRouter key>
CORS_ORIGIN=https://marsfounder-io.vercel.app
EOF

docker build -t marsfounder-api .
docker run -d \
  --name marsfounder-api \
  --restart unless-stopped \
  -p 3000:3000 \
   --env-file /root/marsfounder.env \
  marsfounder-api

# To redeploy after a git push
cd /opt/marsfounder
git pull
docker build -t marsfounder-api .
docker stop marsfounder-api && docker rm marsfounder-api
docker run -d --name marsfounder-api --restart unless-stopped \
   -p 3000:3000 \
   --env-file /root/marsfounder.env \
   marsfounder-api
```

Verify the API is healthy:
```bash
curl http://localhost:3000/api/healthz
# → {"status":"ok"}
```

### CORS
The API reads `CORS_ORIGIN` (comma-separated list of allowed origins). Set this to your Vercel domain(s). If unset, all origins are allowed (dev-only default).

Full deployment guide: [documentation/deployment.md](documentation/deployment.md)

---

## Contributing

This project is open to collaborators. Whether you're interested in the product vision, the tech stack, or just want to build something meaningful — you're welcome here.

Start with [CONTRIBUTING.md](CONTRIBUTING.md) for setup, workflow expectations, and PR guidelines. Bugs and ideas should go through the GitHub issue templates so reports stay actionable.

### Good first contributions
- UI/UX improvements to any page in `artifacts/marsfounder/src/pages/`
- New bot class definitions (schema in `lib/db/src/schema/bots.ts`, seed in `artifacts/api-server/src/lib/seed.ts`)
- New ambient data endpoints (light delay accuracy, weather models)
- Mission feasibility prompt tuning (`artifacts/api-server/src/lib/feasibility.ts`)
- OpenAPI spec completeness (`lib/api-spec/openapi.yaml`)
- Tests — there are none yet; any coverage is welcome

### How to contribute
1. Fork the repo and create a branch (`git checkout -b feat/your-idea`)
2. Follow the local dev setup in [documentation/local-development.md](documentation/local-development.md)
3. For larger changes, open an issue first so the direction is aligned before you spend time building
4. Make your changes and open a PR against `main`
4. Describe what you built and why in the PR description

### Reach out
If you want to discuss the vision, a larger feature, or a collaboration before writing code — open an issue with context and proposed scope.

---

## License

MIT — see [LICENSE](LICENSE)

