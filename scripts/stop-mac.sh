#!/bin/bash

# Stop script for Kanban Project Management App (macOS)
# This script stops and removes the Docker containers

set -e

echo "Stopping Kanban Project Management App..."

# Stop and remove containers
docker-compose down

echo "App stopped successfully!"