# syntax=docker/dockerfile:1
# ==============================================================================
# Production Multi-Stage Dockerfile for NestJS API (apps/api)
# ==============================================================================

FROM node:22-alpine AS base
RUN corepack enable pnpm
WORKDIR /app

FROM base AS builder
COPY pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages/ packages/
COPY apps/api/ apps/api/
COPY data/ data/

RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @papaya/shared build
RUN pnpm --filter @papaya/mcp-server build
RUN pnpm --filter @papaya/api db:generate
RUN pnpm --filter @papaya/api build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

USER node

COPY --chown=node:node --from=builder /app/package.json ./
COPY --chown=node:node --from=builder /app/pnpm-workspace.yaml ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/packages/ packages/
COPY --chown=node:node --from=builder /app/apps/api/dist ./apps/api/dist
COPY --chown=node:node --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --chown=node:node --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --chown=node:node --from=builder /app/data ./data

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/claims || exit 1

CMD ["node", "apps/api/dist/main.js"]
