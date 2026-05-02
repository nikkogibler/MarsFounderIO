# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace manifests first for layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json tsconfig.json ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/integrations-anthropic-ai/package.json ./lib/integrations-anthropic-ai/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY artifacts/api-server/ ./artifacts/api-server/
COPY lib/db/ ./lib/db/
COPY lib/api-zod/ ./lib/api-zod/
COPY lib/integrations-anthropic-ai/ ./lib/integrations-anthropic-ai/

# Build the API server bundle
RUN pnpm --filter @workspace/api-server run build

# Runtime stage — minimal image
FROM node:22-alpine AS runtime

WORKDIR /app

# Only copy the compiled bundle (esbuild bundles everything)
COPY --from=builder /app/artifacts/api-server/dist ./dist

# pino transport workers are emitted alongside the bundle
# node_modules needed only if there are unbundled externals
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
