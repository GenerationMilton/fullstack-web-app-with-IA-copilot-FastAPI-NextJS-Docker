from pydantic import BaseModel, ConfigDict
from typing import Optional


# Auth Models
class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    success: bool
    message: str


# Card Models
class CardCreate(BaseModel):
    id: str
    title: str
    details: str = ""
    position: int


class CardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    title: str
    details: str
    position: int


# Column Models
class ColumnResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    title: str
    position: int
    cards: list[CardResponse] = []


# Board Models
class BoardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    title: str
    columns: list[ColumnResponse]


class BoardUpdate(BaseModel):
    columns: list[ColumnResponse]
    cards: dict[str, CardCreate]


class ChatRequest(BaseModel):
    prompt: str
    history: list[str] = []


class ChatResponse(BaseModel):
    model: str
    reply: str
