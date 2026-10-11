"""Symptom checker chat endpoint."""

from fastapi import APIRouter
from app.schemas import ChatRequest, ChatResponse
from app.services.gemini_chat import SymptomChecker

router = APIRouter()
checker = SymptomChecker()


@router.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    reply = checker.converse(
        [m.model_dump() for m in req.messages],
        patient_history=None,
    )
    return ChatResponse(reply=reply)