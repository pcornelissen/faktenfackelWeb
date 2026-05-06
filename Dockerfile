# syntax=docker/dockerfile:1.7

# Faktenfackel — Production image, Node-Server-Preset.
#
# Multi-stage build:
#   1. deps     — install full deps (incl. dev) for build
#   2. builder  — run pnpm build + generateSourceIndex (creates GraphDB SQLite)
#   3. runtime  — minimal Node image with .output/ and SQLite assets
#
# Both Content-DB (.data/content/build.sqlite, written by @nuxt/content
# during build) and Graph-DB (.data/graph.sqlite, written by
# scripts/generateSourceIndex.ts) are copied into the image at fixed
# paths. Runtime reads them locally — no D1, no remote seeding.

ARG NODE_VERSION=24.10.0
ARG PNPM_VERSION=10.33.2

# ---------------------------------------------------------------------------
# Stage 1: dependency install (cached layer)
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS deps

ARG PNPM_VERSION
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Build tools for native modules (better-sqlite3 ships as source on install)
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 \
      build-essential \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc* ./

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# Stage 2: build (.output + SQLite databases)
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS builder

ARG PNPM_VERSION
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 \
      build-essential \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NITRO_PRESET=node_server
ENV NODE_ENV=production

# Build Nuxt + Nitro. Writes .output/ and .data/content/build.sqlite.
RUN pnpm build

# Build Graph SQLite. GRAPH_DB pins the output path; KNOWLEDGE_MCP_DIR is
# a throw-away because its JSON cache is build-only and not needed in
# the runtime image.
#
# Content DB is NOT built here. @nuxt/content writes seed data as
# .output/public/__nuxt_content/<collection>/sql_dump.txt and seeds the
# local SQLite on first request. The first /api/health hit triggers the
# seed; deploy.sh has a 60s healthcheck window for that.
RUN mkdir -p .data && \
    GRAPH_DB=$(pwd)/.data/graph.sqlite \
    KNOWLEDGE_MCP_DIR=$(mktemp -d) \
    pnpm exec tsx scripts/generateSourceIndex.ts

# Fail-fast if graph DB didn't materialise (content DB is runtime-seeded)
RUN test -s .data/graph.sqlite \
    && test -s .output/public/__nuxt_content/faktenchecks/sql_dump.txt

# ---------------------------------------------------------------------------
# Stage 3: runtime
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS runtime

# tini reaps zombies (Node as PID 1 doesn't reap children cleanly)
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates \
      tini \
      curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Nitro node-server output is standalone: .output/server/node_modules
# already contains all externals (incl. better-sqlite3 native binary,
# built for this same linux/glibc/x64 in the builder stage).
COPY --from=builder --chown=node:node /app/.output ./.output

# .data/ holds the prebuilt graph.sqlite. The content/ subdir is created
# empty here; @nuxt/content seeds .data/content/build.sqlite on first
# request from .output/public/__nuxt_content/*/sql_dump.txt.
COPY --from=builder --chown=node:node /app/.data ./.data
RUN mkdir -p .data/content && chown -R node:node .data

ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV CONTENT_DB_PATH=/app/.data/content/build.sqlite
ENV GRAPH_DB_PATH=/app/.data/graph.sqlite

EXPOSE 3000
USER node

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", ".output/server/index.mjs"]
