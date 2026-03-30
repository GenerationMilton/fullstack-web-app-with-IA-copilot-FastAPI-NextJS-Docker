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


def test_chat_without_api_key(client, monkeypatch):
    """With no OPENROUTER_API_KEY, chat should return 502."""
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    response = client.post("/api/chat", json={"prompt": "2+2", "history": []})
    assert response.status_code == 502
    assert "OPENROUTER_API_KEY is not set" in response.json()["detail"]


@pytest.mark.skipif(
    not __import__("os").getenv("OPENROUTER_API_KEY"),
    reason="Requires OPENROUTER_API_KEY to run against real OpenRouter service",
)
def test_chat_with_real_openrouter(client):
    """When API key is present, /api/chat should call OpenRouter and return model answer."""
    response = client.post("/api/chat", json={"prompt": "2+2", "history": []})
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "4" in data["reply"] or "four" in data["reply"].lower()

