@echo off
REM Stop script for Kanban Project Management App (Windows)
REM This script stops and removes the Docker containers

echo Stopping Kanban Project Management App...

REM Stop and remove containers
docker-compose down

echo App stopped successfully!

pause