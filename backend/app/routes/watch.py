"""Smartwatch data with 5-day history + device pairing."""

from datetime import datetime, timedelta
import random
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

PAIRED_DEVICES: dict[str, list[dict]] = {}


class PairRequest(BaseModel):
    patient_id: str = "mock_abha_12345"
    device_id: str


class WatchSync(BaseModel):
    patient_id: str = "mock_abha_12345"
    heart_rate: list[int] = []
    steps: int = 0
    hydration_ml: int = 0
    stress_level: int = 0
    sleep_hours: float = 0.0
    spo2: int = 0
    calories_burned: int = 0
    timestamp: Optional[str] = None


def _generate_day(patient_id: str, day_offset: int) -> dict:
    """day_offset=0 → today, 1 → yesterday, etc."""
    random.seed(hash(f"{patient_id}-{day_offset}") % 100000)
    date = (datetime.utcnow() - timedelta(days=day_offset)).date().isoformat()

    if day_offset == 0:
        steps = random.randint(4000, 9000)
        hydration = random.randint(1200, 2200)
        active_minutes = random.randint(20, 60)
    else:
        steps = random.randint(5500, 11500)
        hydration = random.randint(1600, 2700)
        active_minutes = random.randint(30, 80)

    sleep_hours = round(random.uniform(5.2, 8.4), 1)
    base_hr = random.randint(66, 80)
    heart_rate = []
    for hour in range(24):
        if 0 <= hour <= 6:
            hr = base_hr - random.randint(5, 13)
        elif 7 <= hour <= 9:
            hr = base_hr + random.randint(8, 22)
        elif 12 <= hour <= 13:
            hr = base_hr + random.randint(4, 14)
        elif 18 <= hour <= 20:
            hr = base_hr + random.randint(12, 32)
        else:
            hr = base_hr + random.randint(-3, 8)
        heart_rate.append(hr)

    if sleep_hours >= 8:
        sleep_quality = "Excellent"
    elif sleep_hours >= 7:
        sleep_quality = "Good"
    elif sleep_hours >= 6:
        sleep_quality = "Fair"
    else:
        sleep_quality = "Poor"

    return {
        "date": date,
        "day_offset": day_offset,
        "heart_rate_hourly": heart_rate,
        "heart_rate_avg": sum(heart_rate) // len(heart_rate),
        "heart_rate_min": min(heart_rate),
        "heart_rate_max": max(heart_rate),
        "resting_hr": base_hr,
        "steps": steps,
        "steps_goal": 10000,
        "hydration_ml": hydration,
        "hydration_goal": 2500,
        "stress_level": random.randint(2, 7),
        "sleep_hours": sleep_hours,
        "sleep_quality": sleep_quality,
        "spo2": random.randint(95, 99),
        "calories_burned": random.randint(1750, 2450),
        "active_minutes": active_minutes,
    }


def _generate_history(patient_id: str, days: int = 5) -> list[dict]:
    result = []
    for offset in range(days - 1, -1, -1):
        result.append(_generate_day(patient_id, offset))
    return result


def _generate_insights(today: dict, history: list[dict]) -> list[dict]:
    insights = []
    past = history[:-1]
    avg_steps = sum(d["steps"] for d in past) / len(past) if past else 0
    avg_sleep = sum(d["sleep_hours"] for d in past) / len(past) if past else 0
    avg_hr = sum(d["heart_rate_avg"] for d in past) / len(past) if past else 0

    if today["heart_rate_avg"] > 85:
        insights.append({
            "type": "warning",
            "title": "Elevated resting heart rate",
            "description": f"Avg {today['heart_rate_avg']} bpm today vs {int(avg_hr)} bpm 4-day average. Normal is 60-80.",
            "action": "Try 10 minutes of deep breathing.",
        })

    if today["steps"] < avg_steps - 1500:
        insights.append({
            "type": "warning",
            "title": "Below your average",
            "description": f"{today['steps']:,} steps today vs {int(avg_steps):,} average.",
            "action": "A 15-minute walk after dinner helps blood sugar.",
        })
    elif today["steps"] > avg_steps + 1500:
        insights.append({
            "type": "success",
            "title": "Above your average!",
            "description": f"{today['steps']:,} steps — {today['steps'] - int(avg_steps):,} above your 5-day average.",
            "action": "Keep up this pace.",
        })
    else:
        insights.append({
            "type": "info",
            "title": "On track with activity",
            "description": f"{today['steps']:,} steps today — close to your average.",
            "action": "Try adding 500 extra steps tomorrow.",
        })

    if today["hydration_ml"] < 1800:
        insights.append({
            "type": "warning",
            "title": "Hydration below target",
            "description": f"{today['hydration_ml']} ml today. Target: 2,500 ml.",
            "action": "Keep a 1L bottle at your desk.",
        })

    if today["sleep_hours"] < avg_sleep - 0.8:
        insights.append({
            "type": "warning",
            "title": "Less sleep than usual",
            "description": f"{today['sleep_hours']} hrs vs {round(avg_sleep, 1)} hrs average.",
            "action": "Try going to bed 30 minutes earlier.",
        })
    elif today["sleep_hours"] >= 7:
        insights.append({
            "type": "success",
            "title": "Healthy sleep",
            "description": f"{today['sleep_hours']} hrs — within the healthy range.",
            "action": "Consistent sleep times matter as much as duration.",
        })

    if today["spo2"] < 96:
        insights.append({
            "type": "warning",
            "title": "Low blood oxygen",
            "description": f"SpO2 {today['spo2']}%. Normal is 95-100%.",
            "action": "If this repeats 3+ days, see a doctor.",
        })

    if today["stress_level"] >= 6:
        insights.append({
            "type": "warning",
            "title": "High stress detected",
            "description": f"Stress {today['stress_level']}/10.",
            "action": "Try 5 minutes of box breathing.",
        })

    return insights


@router.get("/api/watch/data")
def get_watch_data(patient_id: str = "mock_abha_12345"):
    history = _generate_history(patient_id, days=5)
    today = history[-1]
    insights = _generate_insights(today, history)
    return {
        "status": "ok",
        "data": today,
        "history": history,
        "insights": insights,
    }


_MOCK_DEVICES = [
    {"id": "bt-001", "name": "Apple Watch Series 9", "type": "Smartwatch", "signal": -42, "battery": 78},
    {"id": "bt-002", "name": "Samsung Galaxy Watch 6", "type": "Smartwatch", "signal": -58, "battery": 92},
    {"id": "bt-003", "name": "Mi Band 8 Pro", "type": "Fitness Band", "signal": -67, "battery": 65},
    {"id": "bt-004", "name": "Google Pixel Watch 2", "type": "Smartwatch", "signal": -51, "battery": 44},
    {"id": "bt-005", "name": "Noise ColorFit Pro 5", "type": "Smartwatch", "signal": -74, "battery": 88},
    {"id": "bt-006", "name": "Fire-Boltt Ninja Call Pro", "type": "Smartwatch", "signal": -81, "battery": 51},
    {"id": "bt-007", "name": "Boat Wave Active", "type": "Fitness Band", "signal": -63, "battery": 72},
    {"id": "bt-008", "name": "Fitbit Charge 6", "type": "Fitness Band", "signal": -55, "battery": 37},
]


@router.get("/api/watch/devices")
def list_devices(patient_id: str = "mock_abha_12345"):
    paired = PAIRED_DEVICES.get(patient_id, [])
    paired_ids = {d["id"] for d in paired}
    devices = [{**d, "paired": d["id"] in paired_ids} for d in _MOCK_DEVICES]
    return {"status": "ok", "devices": devices, "paired": paired}


@router.post("/api/watch/pair")
def pair_device(req: PairRequest):
    device = next((d for d in _MOCK_DEVICES if d["id"] == req.device_id), None)
    if not device:
        return {"status": "error", "message": "Device not found"}
    if req.patient_id not in PAIRED_DEVICES:
        PAIRED_DEVICES[req.patient_id] = []
    if not any(d["id"] == device["id"] for d in PAIRED_DEVICES[req.patient_id]):
        PAIRED_DEVICES[req.patient_id].append(device)
    return {"status": "ok", "paired_device": device, "connected": True}


@router.post("/api/watch/unpair")
def unpair_device(req: PairRequest):
    if req.patient_id in PAIRED_DEVICES:
        PAIRED_DEVICES[req.patient_id] = [
            d for d in PAIRED_DEVICES[req.patient_id] if d["id"] != req.device_id
        ]
    return {"status": "ok"}


@router.post("/api/watch/sync")
def sync_watch(payload: WatchSync):
    if payload.patient_id not in PAIRED_DEVICES:
        PAIRED_DEVICES[payload.patient_id] = []
    return {"status": "ok", "received": 1}