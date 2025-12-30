# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build both apps
RUN pnpm --filter web build
RUN pnpm --filter api build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install runtime dependencies
RUN apk add --no-cache bash curl jq python3 make g++

# Install bashio for Home Assistant
RUN curl -J -L -o /tmp/bashio.tar.gz \
    "https://github.com/hassio-addons/bashio/archive/v0.16.2.tar.gz" \
    && mkdir /tmp/bashio \
    && tar zxvf /tmp/bashio.tar.gz --strip 1 -C /tmp/bashio \
    && mv /tmp/bashio/lib /usr/lib/bashio \
    && ln -s /usr/lib/bashio/bashio /usr/bin/bashio \
    && rm -rf /tmp/bashio /tmp/bashio.tar.gz

# Copy package.json for production install
COPY apps/api/package.json ./

# Install production dependencies with npm (avoids pnpm symlink issues)
RUN npm install --omit=dev

# Copy built API
COPY --from=builder /app/apps/api/dist ./dist

# Copy Prisma files
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/prisma.config.ts ./

# Copy generated Prisma client (it's in dist due to nest assets config)
COPY --from=builder /app/apps/api/src/generated ./src/generated

# Copy frontend build
COPY --from=builder /app/apps/web/dist ./client

# Copy startup script
COPY run.sh /
RUN chmod +x /run.sh

# Create data directory
RUN mkdir -p /data

CMD ["/run.sh"]
