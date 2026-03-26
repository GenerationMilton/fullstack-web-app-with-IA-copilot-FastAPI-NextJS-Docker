import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    """Test that the root endpoint returns HTML content."""
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "Kanban Project Management" in response.text
    assert "Hello World" in response.text

def test_health_endpoint():
    """Test that the health endpoint returns JSON with correct structure."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"

    data = response.json()
    assert "status" in data
    assert "message" in data
    assert "version" in data
    assert data["status"] == "healthy"
    assert "Kanban backend is running" in data["message"]
    assert data["version"] == "0.1.0"

def test_health_endpoint_values():
    """Test specific values in health endpoint response."""
    response = client.get("/api/health")
    data = response.json()

    assert data["status"] == "healthy"
    assert data["message"] == "Kanban backend is running"
    assert data["version"] == "0.1.0"