@echo off
title iKSANA Workspace - Local Dev Server

echo =======================================
echo  iKSANA Workspace - Local Setup
echo =======================================
echo.

REM ── Check Node.js ───────────────────────────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo [ERROR] Node.js is not installed or not in PATH.
  echo         Download it from https://nodejs.org and install, then re-run this file.
  echo.
  pause
  exit /b 1
)

for /f "tokens=1,2,3 delims=." %%a in ('node -v') do (
  set NODE_MAJOR=%%a
)
set NODE_MAJOR=%NODE_MAJOR:v=%
if %NODE_MAJOR% LSS 18 (
  echo [ERROR] Node.js 18 or higher is required.
  echo         Your version is too old. Please update at https://nodejs.org
  echo.
  pause
  exit /b 1
)
echo [OK] Node.js found (v%NODE_MAJOR%.x)

REM ── Check pnpm ───────────────────────────────────────────────────────────────
where pnpm >nul 2>&1
if %errorlevel% neq 0 (
  echo [INFO] pnpm not found. Installing it now via npm...
  call npm install -g pnpm
  if %errorlevel% neq 0 (
    echo [ERROR] Failed to install pnpm. Please run: npm install -g pnpm
    pause
    exit /b 1
  )
)
echo [OK] pnpm found

REM ── Check .env.local ────────────────────────────────────────────────────────
if not exist ".env.local" (
  echo.
  echo [WARNING] .env.local file not found!
  echo.
  echo   You need to create a .env.local file in this folder with:
  echo.
  echo     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
  echo     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  echo.
  echo   Copy .env.local.example to .env.local and fill in your values.
  echo   Get them from: https://supabase.com/dashboard/project/_/settings/api
  echo.
  pause
  exit /b 1
)
echo [OK] .env.local found

REM ── Install dependencies ─────────────────────────────────────────────────────
echo.
echo Installing dependencies (this may take a minute on first run)...
call pnpm install
if %errorlevel% neq 0 (
  echo [ERROR] pnpm install failed. Check the output above.
  pause
  exit /b 1
)
echo [OK] Dependencies installed

REM ── Start dev server ─────────────────────────────────────────────────────────
echo.
echo =======================================
echo  Starting dev server...
echo  Open your browser at: http://localhost:3000
echo  Press Ctrl+C to stop the server.
echo =======================================
echo.

call pnpm dev
