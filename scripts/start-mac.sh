#!/bin/bash

# Start script for Kanban Project Management App (macOS)
# This script starts the Docker container with the FastAPI backend

set -e

echo "Starting Kanban Project Management App..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Build and start the container
docker-compose up --build -d

echo "App started successfully!"
echo "Frontend will be available at: http://localhost:8000"
echo "API health check at: http://localhost:8000/api/health"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop the app: ./scripts/stop-mac.sh"