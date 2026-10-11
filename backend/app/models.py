"""Database models."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, JSON, DateTime
from app.database import Base


class Record(Base):
    __tablename__ = "records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, index=True, default="mock_abha_12345")
    document_type = Column(String, default="Prescription")
    file_name = Column(String, default="")
    fhir_data = Column(JSON, default=dict)
    ai_insights = Column(JSON, default=dict)
    full_data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)