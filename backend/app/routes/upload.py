"""Upload endpoint — accepts file, runs OCR + LLM, stores result."""

import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.gemini_extractor import GeminiExtractor
from app.database import SessionLocal
from app import models

router = APIRouter()
extractor = GeminiExtractor()

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/api/upload")
async def upload(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    safe_name = f"{file_id}_{file.filename}"
    dest = UPLOAD_DIR / safe_name

    try:
        with open(dest, "wb") as f:
            shutil.copyfileobj(file.file, f)
    except Exception as e:
        raise HTTPException(500, f"Failed to save file: {e}")

    try:
        result = extractor.extract(str(dest))
    except Exception as e:
        raise HTTPException(500, f"Extraction failed: {e}")

    db = SessionLocal()
    try:
        doc_type = (
            result.get("document_metadata", {}).get("document_type", "Prescription")
        )
        record = models.Record(
            patient_id=result.get("patient_context", {}).get(
                "patient_id", "mock_abha_12345"
            ),
            document_type=doc_type,
            file_name=file.filename,
            fhir_data=result.get("fhir_resources", {}),
            ai_insights=result.get("ai_insights", {}),
            full_data=result,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        record_id = record.id
    finally:
        db.close()

    return {"status": "ok", "record_id": record_id, "data": result}