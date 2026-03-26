# Use Python 3.11 slim image
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

# Create static directory for frontend files
RUN mkdir -p backend/app/static

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]