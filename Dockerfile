# Multi-stage build: Frontend build stage
FROM node:20-alpine AS frontend-build

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN cd frontend && npm ci

# Copy source code
COPY frontend/ ./frontend/

# Build the frontend
RUN cd frontend && npm run build

# Backend stage
FROM python:3.11-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Set working directory
WORKDIR /app

# Copy pyproject.toml and install dependencies
COPY backend/pyproject.toml ./backend/
RUN uv pip install --system -r backend/pyproject.toml

# Copy application code
COPY backend/app/ ./backend/app/

# Copy built frontend files to static directory
COPY --from=frontend-build /app/frontend/dist ./backend/app/static

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]