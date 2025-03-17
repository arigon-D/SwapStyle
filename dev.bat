@echo off
echo Setting up SwapStyle development environment...

REM Check if MongoDB is running
sc query MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB is not installed or not running
    echo Please install MongoDB from https://www.mongodb.com/try/download/community
    echo After installation, start MongoDB service using:
    echo net start MongoDB
    pause
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
call npm install

REM Setup environment
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Please update the .env file with your configuration
)

REM Start development server
echo Starting development server...
call npm run dev

REM Clear Next.js cache
rm -rf .next 