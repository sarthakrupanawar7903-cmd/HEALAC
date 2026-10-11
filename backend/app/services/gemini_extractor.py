"""
HEALAC extractor — Tesseract OCR (local) + Groq Llama (LLM).
Reliable, fast, no 503s.
"""

import os
import json
from pathlib import Path
from typing import Optional

import pytesseract
from PIL import Image
from groq import Groq
from dotenv import load_dotenv

# --- Tesseract path ---
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# --- Load env ---
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

_api_key = os.getenv("GROQ_API_KEY")
if not _api_key:
    raise ValueError("GROQ_API_KEY is not set in .env")

client = Groq(api_key=_api_key)

MODEL_NAME = "openai/gpt-oss-120b"


class GeminiExtractor:
    """Class name kept for compatibility with existing imports."""

    def __init__(self, model_name: str = MODEL_NAME):
        self.model_name = model_name

    # ---------- OCR ----------
    def _ocr(self, file_path: str) -> str:
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        if path.suffix.lower() == ".pdf":
            raise ValueError("PDF not supported yet. Use JPG/PNG.")

        img = Image.open(path)
        if img.mode != "RGB":
            img = img.convert("RGB")

        # Upscale small images for better OCR
        if img.width < 1500:
            scale = 1500 / img.width
            img = img.resize(
                (int(img.width * scale), int(img.height * scale)),
                Image.LANCZOS,
            )

        text = pytesseract.image_to_string(img, lang="eng")
        return text.strip()

    # ---------- Prompt ----------
    def _build_prompt(self, ocr_text: str, history: Optional[list] = None) -> str:
        prompt = """You are HEALAC, an expert medical AI assistant.

Read the OCR text from a medical document and return ONE JSON object with this exact structure:

{
  "patient_context": {"patient_id": "mock_abha_12345", "abha_linked": true, "name": "", "age": 0, "gender": ""},
  "document_metadata": {"file_name": "", "upload_date": "2026-10-11T00:00:00Z", "document_type": "Prescription", "facility_name": ""},
  "fhir_resources": {
    "DiagnosticReport": [{"test_name": "", "value": 0, "unit": "", "reference_range": "", "status": "Normal", "date": ""}],
    "MedicationRequest": [{"medicine_name": "", "dosage": "", "frequency": "", "timing": "", "prescribed_by": "", "date": ""}],
    "Condition": [{"condition_name": "", "clinical_status": "Active"}]
  },
  "ai_insights": {
    "plain_language_summary": "",
    "hindi_summary": "",
    "trend_analysis": "",
    "drug_interactions": [{"severity": "Mild", "description": "", "recommendation": ""}],
    "questions_to_ask_doctor": [{"question_en": "", "question_hi": "", "rationale": ""}]
  }
}

RULES:
- document_type must be one of: Prescription, Diagnostic Lab Report, Discharge Summary, Vaccination Record, Imaging/Other
- diagnostic status must be one of: Normal, High, Low, Critical
- plain_language_summary: explain in 6th-grade English. End with the exact disclaimer: "This is an AI-generated summary for informational purposes only. It is not medical advice. Please consult your doctor."
- hindi_summary: translate the plain_language_summary into simple Hindi (Devanagari script)
- trend_analysis: state improving/worsening/stable if history is provided, otherwise "No historical data available."
- questions_to_ask_doctor: 3-5 questions, each in English (question_en) and Hindi (question_hi), plus a rationale
- Use safe wording. Never diagnose. Never suggest dosage changes.
- Fix small OCR errors using medical context.
- Return ONLY the JSON object. No markdown. No explanation. No code fences.
"""

        if history:
            prompt += f"\n\nPATIENT HISTORY (for trend analysis):\n{json.dumps(history, ensure_ascii=False)}\n"

        prompt += f"\n\n--- OCR TEXT ---\n{ocr_text}\n--- END OCR TEXT ---\n\nReturn the JSON object now."
        return prompt

    # ---------- Main extract ----------
    def extract(self, file_path: str, history: Optional[list] = None) -> dict:
        ocr_text = self._ocr(file_path)
        if len(ocr_text) < 10:
            raise ValueError(
                f"OCR extracted too little text ({len(ocr_text)} chars). "
                f"The image may be unclear. Try a higher-resolution photo."
            )

        print(f"[DEBUG] OCR extracted {len(ocr_text)} chars")

        prompt = self._build_prompt(ocr_text, history)

        response = client.chat.completions.create(
            model=self.model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=4096,
            response_format={"type": "json_object"},
        )

        raw = response.choices[0].message.content.strip()

        # Strip markdown fences just in case
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        try:
            return json.loads(raw)
        except json.JSONDecodeError as e:
            raise ValueError(
                f"LLM returned invalid JSON.\nError: {e}\nRaw:\n{raw[:1000]}"
            )


# ---------- CLI test ----------
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python -m app.services.gemini_extractor <path-to-document>")
        sys.exit(1)

    doc_path = sys.argv[1]
    print(f"Extracting from: {doc_path}")
    print(f"[DEBUG] OCR: Tesseract | LLM: {MODEL_NAME}")

    extractor = GeminiExtractor()
    result = extractor.extract(doc_path)

    print(json.dumps(result, indent=2, ensure_ascii=False))