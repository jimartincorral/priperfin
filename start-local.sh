#!/bin/bash
set -e

echo "🚀 Starting PriPerFin locally..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js v20+."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install -g pnpm
    pnpm install
fi

# Build API (Always build to ensure latest code)
echo "🔨 Building API..."
pnpm -F api build

# Build Web if missing
if [ ! -d "apps/web/dist" ]; then
    echo "🔨 Building Web..."
    pnpm -F web build
fi

# Initialize Database
echo "🗄️  Initializing database..."
# Ensure .env exists for API to prevent warnings
if [ ! -f apps/api/.env ]; then
    echo "📝 Creating apps/api/.env from example..."
    cp apps/api/.env.example apps/api/.env
fi
# Run push (uses prisma.config.ts fallback if env missing)
pnpm -C apps/api exec prisma db push

echo "✅ Application ready."
echo "🌐 Starting server on http://localhost:3000"
echo "   (Press Ctrl+C to stop)"

# Set environment variables for local run
export NODE_ENV=production
# Force fallback logic to find web/dist relative to CWD
export STATIC_PATH="$(pwd)/apps/web/dist"
export DATABASE_URL="file:$(pwd)/apps/api/dev.db"
export BACKUP_DIR="$(pwd)/apps/api/backups"

# Run the built API
node apps/api/dist/src/main.js
