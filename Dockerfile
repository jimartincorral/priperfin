FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile

FROM base AS builder-web
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .
RUN pnpm --filter web build

FROM base AS builder-api
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
RUN cd apps/api && npx prisma generate
RUN pnpm --filter api build
# Use pnpm deploy to create a standalone production bundle
RUN pnpm deploy --filter api --prod /prod/api

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install bash and bashio for Home Assistant add-on support
RUN apk add --no-cache bash curl jq

# Install bashio
RUN curl -J -L -o /tmp/bashio.tar.gz \
    "https://github.com/hassio-addons/bashio/archive/v0.16.2.tar.gz" \
    && mkdir /tmp/bashio \
    && tar zxvf /tmp/bashio.tar.gz --strip 1 -C /tmp/bashio \
    && mv /tmp/bashio/lib /usr/lib/bashio \
    && ln -s /usr/lib/bashio/bashio /usr/bin/bashio \
    && rm -rf /tmp/bashio /tmp/bashio.tar.gz

# Copy the deployed API (includes node_modules with resolved symlinks)
COPY --from=builder-api /prod/api ./

# Copy the built dist folder
COPY --from=builder-api /app/apps/api/dist ./dist

# Copy Prisma schema for db push
COPY --from=builder-api /app/apps/api/prisma ./prisma

# Copy frontend build to be served by API
COPY --from=builder-web /app/apps/web/dist ./client

# Copy startup script
COPY run.sh /
RUN chmod +x /run.sh

# Create data directory
RUN mkdir -p /data

# Start the application
CMD ["/run.sh"]
