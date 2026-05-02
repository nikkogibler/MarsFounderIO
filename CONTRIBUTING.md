# Contributing to MarsFounder.io

Thanks for taking the time to contribute.

MarsFounder.io is an early-stage product and open codebase exploring robotic-first Mars pre-deployment. The repo is most useful when contributions are focused, well-explained, and easy to review.

## Best Ways To Contribute

- Fix a bug or rough edge you can reproduce locally
- Improve UX in the frontend app under `artifacts/marsfounder/`
- Expand API coverage or docs in `artifacts/api-server/` and `lib/api-spec/`
- Add tests, validation, or contributor tooling
- Improve docs for setup, deployment, or architecture

## Before You Start

- Search existing issues and pull requests to avoid duplicate work
- For larger features, architectural changes, or new product directions, open an issue first to align on scope
- Read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before participating
- If you are reporting a security issue, follow [SECURITY.md](SECURITY.md) instead of filing a public bug

## Local Setup

Use the full local setup guide in [documentation/local-development.md](documentation/local-development.md).

Quick start:

```bash
pnpm install
export $(grep -v '^#' .env | xargs) && PORT=3000 pnpm --filter @workspace/api-server run dev
cd artifacts/marsfounder && PORT=5173 BASE_PATH=/ pnpm run dev
```

## Working Style

- Use `pnpm` for all workspace commands
- Keep pull requests focused on one change set or problem
- Prefer small, reviewable commits over one large dump
- Update docs when behavior, setup, or deployment steps change
- If you change API contracts, update `lib/api-spec/openapi.yaml` and regenerate dependent clients when needed

## Before Opening A Pull Request

Run the checks that match your change:

```bash
pnpm typecheck
PORT=4173 BASE_PATH=/ pnpm build
```

If your change affects the UI or API behavior, also do a quick manual smoke test locally.

## Pull Request Expectations

Include the following in your PR:

- A clear summary of what changed
- Why the change is needed
- Screenshots or short recordings for visible UI changes
- Notes about env vars, migrations, or API contract changes if applicable
- A linked issue when one exists

## Good First Areas

- `artifacts/marsfounder/src/pages/` for UI polish and interaction improvements
- `artifacts/api-server/src/routes/` for API improvements and cleanup
- `artifacts/api-server/src/lib/seed.ts` for richer starter data
- `lib/api-spec/openapi.yaml` for API schema completeness
- `documentation/` for onboarding and deployment improvements

## Review Process

- Maintainers review for scope, clarity, correctness, and fit with the product direction
- You may be asked to reduce scope, split work, or clarify behavior before merge
- Not every contribution will be merged, but thoughtful contributions will get useful feedback

Thanks for helping make the repo easier to build, understand, and extend.