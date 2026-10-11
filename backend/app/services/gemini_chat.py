"""
Conversational symptom checker — uses the new google-genai SDK.
"""

import os
import json
from pathlib import Path
from typing import Optional

from google import genai
from google.genai import types
from dotenv import load_dotenv

from app.services.utils.prompts import SYMPTOM_CHECK_PROMPT

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


class SymptomChecker:
    def __init__(self, model_name: str = "gemini-3.8-flash"):
        self.model_name = model_name

    def converse(self, messages: list[dict], patient_history: Optional[dict] = None) -> str:
        prompt = SYMPTOM_CHECK_PROMPT

        if patient_history:
            prompt += "\n\nPATIENT CONTEXT:\n"
            prompt += json.dumps(patient_history, indent=2, ensure_ascii=False)

        prompt += "\n\n--- CONVERSATION ---\n"
        for m in messages:
            role = "USER" if m["role"] == "user" else "ASSISTANT"
            prompt += f"{role}: {m['content']}\n"

        prompt += "\nASSISTANT:"

        response = client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.4,
                max_output_tokens=1024,
            ),
        )
        return response.text.strip()