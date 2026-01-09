# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm and build tools
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

# Copy Prisma schema (needed for postinstall generate)
COPY apps/api/prisma ./apps/api/prisma/
COPY apps/api/prisma.config.ts ./apps/api/

# Install all dependencies (ignoring scripts to prevent prisma generate failure)
RUN pnpm install --frozen-lockfile --ignore-scripts


# Copy source code
COPY . .

# Generate Prisma client and build API
WORKDIR /app/apps/api
RUN npx prisma generate
RUN echo "=== Prisma client generated ===" && ls -la src/generated/client/ || echo "Generated folder missing!"
RUN npx nest build
RUN echo "=== API build complete ===" && ls -la dist/ && ls -la dist/src/ || echo "Build output missing!"

# Build web
WORKDIR /app/apps/web
RUN npm run build
RUN echo "=== Web build complete ===" && ls -la dist/ || echo "Web build missing!"

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

# Remove postinstall script to prevent prisma generate (CLI not installed in prod)
# This allows us to remove --ignore-scripts so better-sqlite3 can build
RUN npm pkg delete scripts.postinstall

# Install production dependencies with npm (legacy-peer-deps for NestJS 11 compatibility)
RUN npm install --omit=dev --legacy-peer-deps

# Copy built API (note: output is in dist/src/ due to tsconfig)
COPY --from=builder /app/apps/api/dist ./dist

# Copy Prisma files
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/prisma.config.ts ./

# Copy generated Prisma client (nest-cli.json now copies it to dist/src/generated during build)
# This is a backup in case the asset copy didn't work
COPY --from=builder /app/apps/api/dist/src/generated ./dist/src/generated

# Copy frontend build
COPY --from=builder /app/apps/web/dist ./client

# Copy startup script
COPY run.sh /run.sh
RUN chmod +x /run.sh

# Debug: show what we have
RUN echo "=== Final container contents ===" && ls -la dist/ && ls -la dist/src/ || echo "Missing dist!"

# Create data directory
RUN mkdir -p /data

CMD ["/run.sh"]
