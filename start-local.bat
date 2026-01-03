@echo off
setlocal

echo 🚀 Starting PriPerFin locally...

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed. Please install Node.js v20+.
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install -g pnpm
    call pnpm install
)

REM Build API (Always build to ensure latest code)
echo 🔨 Building API...
call pnpm -F api build

if not exist "apps\web\dist" (
    echo 🔨 Building Web...
    call pnpm -F web build
)

REM Initialize Database
echo 🗄️  Initializing database...
if not exist "apps\api\.env" (
    echo 📝 Creating apps/api/.env from example...
    copy apps\api\.env.example apps\api\.env
)
call pnpm -C apps/api exec prisma db push

echo ✅ Application ready.
echo 🌐 Starting server on http://localhost:3000
echo    (Press Ctrl+C to stop)

REM Set environment variables
set NODE_ENV=production
set STATIC_PATH=%cd%\apps\web\dist
set DATABASE_URL=file:%cd%\apps\api\dev.db
set BACKUP_DIR=%cd%\apps\api\backups

REM Run the built API
node apps\api\dist\src\main.js
