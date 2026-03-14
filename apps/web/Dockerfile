# =============================================================================
# Grant Web – Multi-stage Dockerfile
# =============================================================================
# Build context: monorepo root (run with -f apps/web/Dockerfile)
#
# No build-time URL args: the app loads config at runtime from GET /api/config
# (reads process.env.APP_URL, APP_URL_API, etc. set by compose env_file).
#
#   docker build -f apps/web/Dockerfile -t grant-web .
# =============================================================================

FROM node:22-alpine AS base
RUN npm install -g pnpm@8.15.0
WORKDIR /app

FROM base AS builder

COPY . .

RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm --filter @grantjs/client build
RUN pnpm --filter grant-web build

FROM node:22-alpine AS runner

RUN apk add --no-cache wget

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

WORKDIR /app

COPY --from=builder --chown=nodejs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nodejs:nodejs /app/apps/web/public ./apps/web/public

USER nodejs

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

WORKDIR /app/apps/web
CMD ["node", "server.js"]
