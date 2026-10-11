"""Pydantic schemas."""

from typing import Any
from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    patient_id: str = "mock_abha_12345"
    messages: list[ChatMessage]


class ChatResponse(BaseModel):
    reply: str


class RecordSummary(BaseModel):
    id: int
    patient_id: str
    document_type: str
    file_name: str
    created_at: str


class UploadResponse(BaseModel):
    status: str
    record_id: int
    data: dict[str, Any]