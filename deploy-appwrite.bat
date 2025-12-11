@echo off
REM Appwrite Hosting Deployment Script for Windows
REM This script prepares your Next.js app for Appwrite hosting

echo 🚀 Starting Appwrite deployment preparation...

REM Check if Node.js is available
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 20+ first.
    exit /b 1
)

REM Get Node.js version
for /f "tokens=1 delims=v" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=1 delims=." %%i in ("%NODE_VERSION%") do set NODE_MAJOR=%%i

if %NODE_MAJOR% LSS 20 (
    echo ❌ Node.js version 20+ is required. Current version: %NODE_VERSION%
    exit /b 1
)

echo ✅ Node.js %NODE_VERSION% detected

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

REM Build the application
echo 🔨 Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    exit /b 1
)

REM Verify build
echo 🔍 Verifying build...
if not exist .next (
    echo ❌ Build failed - .next directory not found
    exit /b 1
)

if not exist .next\BUILD_ID (
    echo ❌ Build failed - BUILD_ID not found
    exit /b 1
)

echo ✅ Build verified successfully

REM Create deployment package
echo 📦 Creating deployment package...
set DEPLOYMENT_ZIP=landsale-frontend-deployment-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%.zip
set DEPLOYMENT_ZIP=%DEPLOYMENT_ZIP: =0%

REM Create zip with necessary files (requires PowerShell)
powershell -Command "Compress-Archive -Path '.next','public','package.json','package-lock.json','next.config.ts','.env.production' -DestinationPath '%DEPLOYMENT_ZIP%' -Force"

echo ✅ Deployment package created: %DEPLOYMENT_ZIP%

REM Display file size
for %%A in ("%DEPLOYMENT_ZIP%") do set FILE_SIZE=%%~zA
echo 📊 Package size: %FILE_SIZE% bytes

echo.
echo 🎉 Deployment preparation complete!
echo.
echo Next steps:
echo 1. Access your Appwrite console: http://75.119.150.209/console/project-default-693962bb002fb1f881bd/sites/create-site/manual
echo 2. Upload the deployment package: %DEPLOYMENT_ZIP%
echo 3. Configure environment variables from .env.production
echo 4. Deploy your application
echo.
echo Alternatively, you can:
echo - Use Git integration for automatic deployments
echo - Deploy manually via Appwrite CLI

REM Open the console URL
start http://75.119.150.209/console/project-default-693962bb002fb1f881bd/sites/create-site/manual

echo.
echo Press any key to exit...
pause >nul