# =============================================================================
# Grant SDK Example (Next.js) – Static export + Nginx (CSR)
# =============================================================================
# Build context: monorepo root. output: "export"; no Node runtime.
# Gateway forwards the full URI (/example/…) without stripping the prefix.
#
#   docker build -f packages/@grantjs/client/examples/nextjs/Dockerfile -t example-nextjs .
# =============================================================================

FROM node:22-alpine AS base
RUN npm install -g pnpm@8.15.0
WORKDIR /app

FROM base AS builder

COPY . .
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm --filter @grantjs/client build
RUN pnpm --filter example-nextjs-client build

FROM nginx:alpine AS runner

RUN apk add --no-cache wget

COPY packages/@grantjs/client/examples/nextjs/nginx.conf /etc/nginx/conf.d/default.conf
# Static export writes to out/ (basePath only affects asset URLs); files served under /example/ prefix
COPY --from=builder /app/packages/@grantjs/client/examples/nextjs/out/. /usr/share/nginx/html/example/

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
