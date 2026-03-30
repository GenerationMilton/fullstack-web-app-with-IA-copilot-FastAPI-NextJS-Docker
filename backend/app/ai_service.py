import json
import os
from typing import Any, Dict, List, Optional

import httpx

from app.schemas import ChatRequest, ChatResponse

OPENROUTER_URL = "https://api.openrouter.ai/v1/chat/completions"
OPENROUTER_MODEL = "openai/gpt-oss-120b"


class AIServiceError(Exception):
    pass


def send_chat_request(request: ChatRequest) -> ChatResponse:
    """Send a chat request to OpenRouter and return response with structured output."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise AIServiceError("OPENROUTER_API_KEY is not set")

    messages = _build_messages(request)

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 800,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(OPENROUTER_URL, json=payload, headers=headers)

        if resp.status_code != 200:
            raise AIServiceError(f"OpenRouter API error {resp.status_code}: {resp.text}")

        data = resp.json()

        model = data.get("model", OPENROUTER_MODEL)
        content = _extract_response_content(data)
        return _parse_structured_response(content, model)
    except httpx.RequestError as exc:
        raise AIServiceError(f"OpenRouter request failed: {str(exc)}")


def _build_messages(request: ChatRequest) -> List[Dict[str, Any]]:
    system_prompt = (
        "You are a Kanban board assistant. "
        "You receive user prompts and optionally a board snapshot. "
        "Generate a JSON object with keys: 'reply' (text) and optional 'updates' (board object) in the response message. "
        "If no board update is needed, send only 'reply'."
    )

    messages = [{"role": "system", "content": system_prompt}]

    if request.board is not None:
        try:
            board_json = json.dumps(request.board)
        except (TypeError, ValueError):
            board_json = "{}"

        messages.append({
            "role": "user",
            "content": f"Current board state: {board_json}",
        })

    if request.history:
        for item in request.history:
            messages.append({"role": "user", "content": item})

    messages.append({
        "role": "user",
        "content": "User question: " + request.prompt,
    })

    return messages


def _extract_response_content(response_json: dict) -> str:
    choices = response_json.get("choices")
    if not choices or not isinstance(choices, list):
        raise AIServiceError("OpenRouter response missing choices")

    first = choices[0]
    message = first.get("message") or first.get("delta")
    if not message:
        raise AIServiceError("OpenRouter response missing message content")

    content = message.get("content")
    if not content:
        raise AIServiceError("OpenRouter response message content empty")

    return content.strip()


def _parse_structured_response(content: str, model: str) -> ChatResponse:
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        return ChatResponse(model=model, reply=content)

    reply = parsed.get("reply")
    updates = parsed.get("updates")

    if not isinstance(reply, str) or not reply.strip():
        reply = content

    return ChatResponse(model=model, reply=reply.strip(), updates=updates)
