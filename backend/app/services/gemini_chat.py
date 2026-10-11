"""
HEALAC conversational symptom checker.
Uses Groq Llama for fast, reliable multi-turn chat.
"""

import os
import json
from pathlib import Path
from typing import Optional

from groq import Groq
from dotenv import load_dotenv

from app.services.utils.prompts import SYMPTOM_CHECK_PROMPT

# Load .env from backend root
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

_api_key = os.getenv("GROQ_API_KEY")
if not _api_key:
    raise ValueError("GROQ_API_KEY is not set in .env")

client = Groq(api_key=_api_key)

MODEL_NAME = "openai/gpt-oss-120b"


class SymptomChecker:
    """Multi-turn symptom checker using Groq Llama."""

    def __init__(self, model_name: str = MODEL_NAME):
        self.model_name = model_name

    def converse(
        self,
        messages: list[dict],
        patient_history: Optional[dict] = None,
    ) -> str:
        """
        Args:
            messages: [{"role": "user"|"assistant", "content": "..."}]
            patient_history: optional dict with prior conditions/medications

        Returns:
            Next assistant message.
        """
        # Build the full prompt with system instructions
        prompt = SYMPTOM_CHECK_PROMPT

        if patient_history:
            prompt += "\n\nPATIENT CONTEXT (prior conditions, medications):\n"
            prompt += json.dumps(patient_history, indent=2, ensure_ascii=False)

        prompt += "\n\n--- CONVERSATION SO FAR ---\n"
        for m in messages:
            role_label = "USER" if m["role"] == "user" else "ASSISTANT"
            prompt += f"{role_label}: {m['content']}\n"

        prompt += "\nASSISTANT:"

        response = client.chat.completions.create(
            model=self.model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=1024,
        )

        return response.choices[0].message.content.strip()