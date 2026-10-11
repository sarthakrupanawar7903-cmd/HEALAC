"""Get health records and timeline."""

from fastapi import APIRouter, HTTPException
from app.database import SessionLocal
from app import models

router = APIRouter()


@router.get("/api/records")
def list_records(patient_id: str = "mock_abha_12345"):
    db = SessionLocal()
    try:
        rows = (
            db.query(models.Record)
            .filter(models.Record.patient_id == patient_id)
            .order_by(models.Record.created_at.desc())
            .all()
        )
        return [
            {
                "id": r.id,
                "patient_id": r.patient_id,
                "document_type": r.document_type,
                "file_name": r.file_name,
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ]
    finally:
        db.close()


@router.get("/api/records/{record_id}")
def get_record(record_id: int):
    db = SessionLocal()
    try:
        r = db.query(models.Record).filter(models.Record.id == record_id).first()
        if not r:
            raise HTTPException(404, "Record not found")

        # Prefer full_data (nested shape matching upload response)
        if r.full_data:
            return r.full_data

        # Fallback for old records
        return {
            "patient_context": {
                "patient_id": r.patient_id,
                "abha_linked": True,
                "name": "Patient",
                "age": 0,
                "gender": "Unknown",
            },
            "document_metadata": {
                "file_name": r.file_name,
                "upload_date": r.created_at.isoformat(),
                "document_type": r.document_type,
                "facility_name": "",
            },
            "fhir_resources": r.fhir_data or {},
            "ai_insights": r.ai_insights or {},
        }
    finally:
        db.close()