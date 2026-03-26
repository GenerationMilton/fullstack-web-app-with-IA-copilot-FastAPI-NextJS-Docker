@echo off
REM Start script for Kanban Project Management App (Windows)
REM This script starts the Docker container with the FastAPI backend

echo Starting Kanban Project Management App...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running. Please start Docker first.
    exit /b 1
)

REM Build and start the container
docker-compose up --build -d

echo App started successfully!
echo Frontend will be available at: http://localhost:8000
echo API health check at: http://localhost:8000/api/health
echo.
echo To view logs: docker-compose logs -f
echo To stop the app: scripts\stop.bat

pause