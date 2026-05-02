# API Reference

Browser-facing base URL (production app): `https://marsfounder-io.vercel.app/api`  
Direct VPS API base URL: `http://145.14.157.203:3000/api`  
Base URL (local dev): `http://localhost:3000/api`

For browser traffic in production, prefer the Vercel `/api/*` path so requests stay on HTTPS and avoid mixed-content blocking.

All responses are JSON. All write endpoints accept `Content-Type: application/json`.

---

## Health

### `GET /api/healthz`
Returns server status.

**Response** `200`
```json
{ "status": "ok" }
```

---

## Bots

### `GET /api/bots`
Returns all bot classes.

**Response** `200` — array of `BotClass`

### `GET /api/bots/:botId`
Returns a single bot class by ID.

**Response** `200` — `BotClass` | `404`

---

## Equipment

### `GET /api/tools`
Returns all available tools (static seed data).

**Response** `200` — array of tools

### `GET /api/addons`
Returns all available add-ons (static seed data).

**Response** `200` — array of add-ons

---

## Builds

### `GET /api/builds`
Returns all builds for the current founder.

**Response** `200` — array of `Build`

### `POST /api/builds`
Creates a new build. Rate limited: 30 req/min.

**Body**
```json
{
  "name": "string",
  "botClassId": "string",
  "toolIds": ["string"],
  "addonIds": ["string"],
  "founderHandle": "string"
}
```

**Response** `201` — created `Build`

### `GET /api/builds/:buildId`
Returns a single build by ID.

**Response** `200` — `Build` | `404`

---

## Missions

### `GET /api/missions`
Returns all missions.

**Response** `200` — array of `Mission`

### `GET /api/missions/recent`
Returns recently created missions.

**Response** `200` — array of `Mission`

### `GET /api/missions/:missionId`
Returns a single mission by ID.

**Response** `200` — `Mission` | `404`

### `POST /api/missions`
Creates a new mission. Rate limited: 30 req/min.

**Body**
```json
{
  "name": "string",
  "buildId": "uuid",
  "objective": "string",
  "missionBrief": "string (optional)",
  "targetMaterial": "string (optional)",
  "durationSols": 10,
  "locationName": "string",
  "latitude": 4.5895,
  "longitude": 137.4417,
  "founderHandle": "string"
}
```

**Response** `201` — created `Mission`

### `POST /api/missions/:missionId/feasibility`
AI-powered feasibility analysis for a mission. Rate limited: 15 req/min (AI limiter).

**Response** `200` — feasibility report (streamed or object, see `lib/feasibility.ts`)

---

## Personas

### `POST /api/personas/:botId/reply`
AI persona chat reply from a bot. Rate limited: 15 req/min (AI limiter).

**Body**
```json
{
  "message": "string",
  "history": [{ "role": "user|assistant", "content": "string" }]
}
```

**Response** `200` — `{ "reply": "string" }`

---

## Marketplace

### `GET /api/marketplace/skills`
Returns available marketplace skills.

**Response** `200` — array of marketplace skill objects

---

## Dashboard

### `GET /api/dashboard/summary`
Returns aggregated dashboard summary (mission counts, build counts, telemetry).

**Response** `200` — summary object

---

## Ambient

### `GET /api/ambient/mars-time`
Current Mars Sol Date and local mean solar time.

### `GET /api/ambient/light-delay`
Current Earth–Mars light delay in seconds.

### `GET /api/ambient/dust-storm`
Current dust storm status (`{ active: boolean, severity?: string }`).

---

## Waitlist

### `POST /api/waitlist`
Registers a waitlist signup. Rate limited: 5 req/10 min.

**Body**
```json
{
  "email": "string",
  "role": "string",
  "company": "string (optional)",
  "notes": "string (optional)"
}
```

**Response** `201` — created entry | `409` if email already registered

---

## Rate Limits

| Limit group | Routes | Window | Max requests |
|-------------|--------|--------|-------------|
| AI | `/api/personas/*`, `/api/missions/:id/feasibility` | 1 min | 15 |
| Write | `POST /api/builds`, `POST /api/missions` | 1 min | 30 |
| Waitlist | `POST /api/waitlist` | 10 min | 5 |

Rate limit errors return `429` with `{ "error": "..." }`.
