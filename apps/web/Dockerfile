# -----------------------------------------------------------------------------
# Stage 1: Base Image & Package Manager
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

# -----------------------------------------------------------------------------
# Stage 2: Dependencies Installation
# -----------------------------------------------------------------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable pnpm package manager
RUN corepack enable pnpm

# Copy Turborepo / workspace files
COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/

# Install web application dependencies
RUN pnpm --filter web install --frozen-lockfile || pnpm --filter web install

# -----------------------------------------------------------------------------
# Stage 3: Next.js Standalone Build
# -----------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app
RUN corepack enable pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .

# Set environment variables for Next.js build
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/telemetry \
    NEXT_PUBLIC_API_URL=http://localhost:8000

RUN pnpm --filter web build

# -----------------------------------------------------------------------------
# Stage 4: Production Runner Image
# -----------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Create non-root nodejs system user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build output & static files
COPY --from=builder /app/apps/web/public* ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]