import os
import json

import pytest
from app.ai_service import send_chat_request, AIServiceError
from app.schemas import ChatRequest


class DummyResponse:
    status_code = 200

    def json(self):
        return {
            "model": "openai/gpt-oss-120b",
            "choices": [
                {
                    "message": {
                        "content": json.dumps({
                            "reply": "OK",
                            "updates": {
                                "id": 1,
                                "title": "My Board",
                                "columns": [],
                            },
                        })
                    }
                }
            ],
        }


class DummyClient:
    def __init__(self, timeout):
        pass

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def post(self, *args, **kwargs):
        return DummyResponse()


def test_send_chat_request_with_structured_response(monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "dummy")
    monkeypatch.setattr("app.ai_service.httpx.Client", DummyClient)

    request = ChatRequest(prompt="What is 2+2?", history=["hi"], board={"id": 1, "title": "Board", "columns": []})
    response = send_chat_request(request)

    assert response.reply == "OK"
    assert response.updates is not None
    assert response.model == "openai/gpt-oss-120b"


def test_send_chat_request_missing_api_key(monkeypatch):
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    request = ChatRequest(prompt="2+2", history=[])

    with pytest.raises(AIServiceError, match="OPENROUTER_API_KEY is not set"):
        send_chat_request(request)
