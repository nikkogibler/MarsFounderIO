# MarsFounder.io: The Robotic-First Mars Pre-deployment Platform

## Vision: Establishing a "Turnkey Civilization"
Based on the **"Robotic Mars Pre-Deployment Program Projection,"** this repository represents the software infrastructure for **MarsFounder.io**. 

The core philosophy is a **Robots-First Doctrine**: recognizing that biological vulnerability is the primary bottleneck in planetary colonization. This platform is designed to manage a 50-year strategic window of autonomous and teleoperated pre-deployment, building an integrated planetary network of power, compute, and life-support infrastructure—a "Turnkey Civilization" that awaits human arrival as a completed utility.

---

## What is being built?
This codebase is a comprehensive **Mission Control and Ecosystem Management Platform**. It coordinates the deployment of robotic fleets, the acquisition of specialized AI "skills," and the monitoring of Martian infrastructure.

### Core Modules
* **Mission Control Dashboard:** A real-time telemetry interface for tracking planetary infrastructure, power grids (Fission vs. Photon), and resource levels.
* **Skill Marketplace:** A modular system for deploying AI Agents with specific capabilities (e.g., `audit-website`, `autoresearch`, `design-taste-frontend`). In the context of Mars, these represent the software payloads for specialized robotic hardware.
* **Persona Engine:** An AI-driven interface (utilizing Anthropic's Claude) that allows founders to interact with specialized consultants and mission commanders.
* **Telemetry & Environmental Simulation:** Systems built to handle Martian-specific constraints like **Light Delay** (telemetry lag) and environmental volatility (dust storms).

---

## Project Structure
This is a monorepo organized for high scalability and shared logic:

```text
├── artifacts/
│   ├── marsfounder/      # The primary React/Vite/Tailwind Web Frontend
│   ├── api-server/       # Node.js/TypeScript Backend (Mission telemetry, Bots, Personas)
│   └── mockup-sandbox/   # UI Component development environment
├── lib/
│   ├── api-spec/         # OpenAPI/Zod definitions for Mars-Earth communication
│   ├── db/               # Drizzle ORM schemas for mission data and land registry
│   ├── integrations/     # AI logic (Anthropic AI) for agent reasoning
│   └── api-client-react/ # Generated hooks for frontend-backend sync
├── .agents/              # Metadata and assets for the robotic agent fleet
└── my-instructions/      # Domain-specific "Skills" (Knowledge bases for AI agents)
```

---

## Technical Stack
* **Frontend:** React 18, Vite, Tailwind CSS, Shadcn UI, Framer Motion — deployed on **Vercel**
* **Backend:** Node.js, Express 5, TypeScript — deployed on **Hostinger VPS** via Docker
* **Database:** Drizzle ORM + **Neon serverless PostgreSQL**
* **AI/LLM:** OpenRouter (`deepseek/deepseek-v4-flash`) for persona replies and mission feasibility analysis
* **Package Management:** `pnpm` workspaces for efficient monorepo handling

---

## Key Features
1.  **Light Delay Compensation:** The API and Frontend are architected to simulate and manage the communication lag between Earth and Mars.
2.  **Skill-Based Agent Architecture:** Unlike static bots, these agents are "hot-swappable" with skills. You can "upload" new capabilities to your robotic fleet via the marketplace.
3.  **Planetary Grid Management:** Tools to track the transition from RTGs (Radioisotope Thermoelectric Generators) to multi-megawatt fission systems as described in the strategic projection.
4.  **Onchain Land Registry:** Foundational logic for property rights and blockchain-based resource allocation on the Martian surface.

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
- Required env var in Vercel dashboard:
  - `VITE_API_URL` → your VPS public URL (e.g. `http://<vps-ip>:3000`)

### API Server — Hostinger VPS (Docker)
The repo includes a `Dockerfile` at the root. To deploy or redeploy on the VPS:

```bash
# First time
git clone https://github.com/nikkogibler/MarsFounderIO.git /opt/marsfounder
cd /opt/marsfounder
docker build -t marsfounder-api .
docker run -d \
  --name marsfounder-api \
  --restart unless-stopped \
  -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="<your Neon connection string>" \
  -e OPENROUTER_API_KEY="<your OpenRouter key>" \
  -e CORS_ORIGIN="https://marsfounder.io,https://www.marsfounder.io" \
  marsfounder-api

# To redeploy after a git push
cd /opt/marsfounder
git pull
docker build -t marsfounder-api .
docker stop marsfounder-api && docker rm marsfounder-api
docker run -d ... (same run command as above)
```

Verify the API is healthy:
```bash
curl http://localhost:3000/api/healthz
# → {"status":"ok"}
```

### CORS
The API reads `CORS_ORIGIN` (comma-separated list of allowed origins). Set this to your Vercel domain(s). If unset, all origins are allowed (dev-only default).

---
