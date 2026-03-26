import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


def test_health_endpoint(client):
    """Test health check endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Kanban backend" in data["message"]


def test_root_endpoint(client):
    """Test root endpoint returns HTML."""
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "Kanban Project Management" in response.text


def test_login_valid_credentials(client):
    """Test login with correct credentials."""
    response = client.post("/api/login", json={"username": "user", "password": "password"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_login_invalid_password(client):
    """Test login with wrong password."""
    response = client.post("/api/login", json={"username": "user", "password": "wrong"})
    assert response.status_code == 401


def test_login_invalid_username(client):
    """Test login with wrong username."""
    response = client.post("/api/login", json={"username": "wronguser", "password": "password"})
    assert response.status_code == 401
