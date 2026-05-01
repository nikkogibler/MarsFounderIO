# Skills

Personal skills for this project. Each skill lives in its own folder with a `SKILL.md`.

## Currently installed

### Aesthetic & Frontend

### `design-taste-frontend/`
Senior UI/UX engineering rulebook. Anti-AI-slop guardrails, deterministic typography (Geist/Satoshi/Cabinet Grotesk — Inter is BANNED), Tailwind/React conventions, Framer Motion spring physics, Bento 2.0 architecture. Has dial-based config (DESIGN_VARIANCE=8, MOTION_INTENSITY=6, VISUAL_DENSITY=4). **Always-on engineering rulebook** — applies on top of any visual aesthetic.

### `industrial-brutalist-ui/`
Raw mechanical interfaces fusing Swiss typographic print with military terminal aesthetics. Two visual archetypes: **Swiss Industrial Print** (light/newsprint) or **Tactical Telemetry & CRT Terminal** (dark/HUD). Pick ONE per project. Hazard red accent only. ASCII syntax decoration, crosshairs, scanlines, halftones. Aerospace/declassified-blueprint vibe.

### `minimalist-ui/`
Premium editorial minimalism (Notion-tier). Warm monochrome palette, bento grids, muted pastel accents, no shadows/gradients/emojis, no AI copywriting clichés. Lyon Text + Geist Sans. Document-style interfaces.

### Animation

### `gsap-core/`
Official GSAP core API reference. Tweens (`gsap.to/from/fromTo/set`), eases, stagger, transform aliases, defaults, `gsap.matchMedia()` for responsive + `prefers-reduced-motion`. The framework-agnostic animation engine.

### `gsap-scrolltrigger/`
Official GSAP ScrollTrigger reference. Scroll-linked animations, pinning, scrub, batched callbacks, smooth-scroll proxy, horizontal containerAnimation. The right tool for full-page scrollytelling.

**Coordination rule (from `design-taste-frontend`):** Framer Motion for component-level UI/Bento interactions. GSAP exclusively for full-page scrollytelling or canvas backgrounds, isolated in their own components with strict useEffect cleanup. **Never mix GSAP and Framer Motion in the same component tree.**

### Quality

### `optimize/`
Performance/optimization audit checklist. Bottlenecks, memory leaks, algorithm improvements, caching, concurrency. Run as a quality gate after major builds.

### Copywriting

### `humanizer/`
Strip AI-generated writing tells out of text. Based on Wikipedia's "Signs of AI writing" guide. Detects and rewrites: inflated significance/legacy claims, promotional puffery, superficial `-ing` analyses, vague attributions, em-dash overuse, rule of three, AI vocabulary words (`delve`, `tapestry`, `pivotal`, `underscore`, etc.), passive voice, negative parallelisms, copula avoidance, false ranges, elegant variation. Includes a "voice calibration" mode where you feed it a sample of your own writing for tone matching, plus a "personality and soul" pass that adds opinions, varied rhythm, and edge instead of just stripping bad patterns.

### Session Continuity (paired skills)

### `handoff/`
Write a date-stamped continuation-grade markdown handoff doc so another agent (or future-you) can resume work without rebuilding context from chat. Strict filename convention (`YYYY-MM-DD-HHMM_CATEGORY_artifact-slug_session-handoff.md` with categories like `DEBUG_`, `NEWFEATURE_`, `EXPERIMENT_`, `IMPROVEMENT_`). Required structure: metadata, purpose, final state, files changed, decisions, validation status, current state to preserve, next steps, short continuation summary. Verification discipline: only mark facts as verified if they actually were.

### `resume-from-handoff/`
Receiving-side counterpart. Reads a handoff markdown, extracts actionable context, **verifies the important referenced files** before editing (handoff is orientation, not gospel), summarizes a compact import brief, then continues work. Calls out stale claims, falls back to live workspace state when handoff is outdated, preserves listed constraints unless overridden.

### Tooling / Meta

### `browser-use/`
Browser automation CLI (`browser-use` command). Persistent headless/headed Chromium with ~50ms latency. Navigate, inspect via element indices, click/type/upload, screenshot, run JS, wait for selectors, manage cookies, persistent Python session. Good for scraping, web testing, and form automation outside Replit's existing Playwright-based testing skill. **Note:** requires the `browser-use` CLI to be installed locally; overlaps with Replit's built-in `testing` skill (Playwright) — prefer `testing` for in-app e2e tests, `browser-use` for arbitrary external sites.

### `autoresearch/`
**Meta-skill** — autonomous self-improvement loop for other skills (Karpathy-style autoresearch). Runs a target skill repeatedly against test inputs, scores outputs against binary yes/no evals, mutates the prompt, keeps wins, discards losses. Outputs an improved `SKILL.md`, `results.tsv` log, `changelog.md`, and a live HTML dashboard. Use when a skill works "70% of the time" and you want to grind that ceiling up. References `references/eval-guide.md` for how to write evals that actually work. **Note:** authored for Claude Code — `open dashboard.html` (macOS) and `view_image` references will need lightweight adapting for Replit; the methodology is portable.

### PRD Lifecycle (workflow system — three skills work together)

All three write to `docs/` with the convention: `docs/00_SYSTEM_MANIFEST.md`, `docs/INDEX.md`, and per-feature `docs/features/prd-NNN-name.md`.

### `prd-reverse-engineer/`
**Code → Docs.** Audit the existing codebase, generate a System Manifest + per-feature PRDs documenting what's actually built. No hallucinations — only what the code does.

### `prd-plan-new-feature/`
**Idea → Docs.** Draft a PRD for a proposed feature that fits the existing architecture (reads the System Manifest first). Output includes objective, user stories, integration points, and a coding checklist.

### `prd-sync/`
**Maintenance.** Scan recent code changes, find the corresponding PRD, update it so the docs never lie. Code is king — if the code says B and the PRD says A, the PRD changes.

## When to load

The agent loads a skill's full `SKILL.md` only when relevant. To make sure a skill applies to a specific build, either:
- Reference it by name in the chat ("apply the industrial-brutalist-ui skill")
- Note the active skill in `replit.md` so it's loaded every session
