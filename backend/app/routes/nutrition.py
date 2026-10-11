"""Nutrition: AI-powered personalized plan + food analysis."""

import os
import json
from pathlib import Path
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "openai/gpt-oss-120b"

router = APIRouter()


class NutritionProfile(BaseModel):
    patient_id: str = "mock_abha_12345"
    name: str = ""
    age: int = 30
    gender: str = "Male"
    weight_kg: float = 70
    height_cm: float = 170
    activity_level: str = "Moderate"
    diet_type: str = "Vegetarian"
    conditions: list[str] = []
    goal: str = "Maintain weight"
    wake_time: str = "07:00"
    sleep_time: str = "23:00"
    meals_per_day: int = 3
    allergies: list[str] = []


class FoodLogInput(BaseModel):
    patient_id: str = "mock_abha_12345"
    meal_text: str
    conditions: list[str] = []
    daily_targets: Optional[dict] = None


@router.post("/api/nutrition/plan")
def generate_plan(profile: NutritionProfile):
    """Generate a personalized nutrition plan using Groq."""
    prompt = f"""You are HEALAC's nutrition AI. Generate a personalized daily nutrition plan.

USER PROFILE:
- Name: {profile.name or "User"}
- Age: {profile.age}, {profile.gender}
- Weight: {profile.weight_kg} kg, Height: {profile.height_cm} cm
- Activity level: {profile.activity_level}
- Diet type: {profile.diet_type}
- Existing conditions: {", ".join(profile.conditions) if profile.conditions else "None"}
- Goal: {profile.goal}
- Wake: {profile.wake_time}, Sleep: {profile.sleep_time}
- Meals per day: {profile.meals_per_day}
- Allergies/avoid: {", ".join(profile.allergies) if profile.allergies else "None"}

Return ONE JSON object with EXACTLY this structure (no markdown, no extra keys):

{{
  "bmi": <float>,
  "bmi_category": "<Underweight|Normal|Overweight|Obese>",
  "daily_calories": <int>,
  "protein_g": <int>,
  "carbs_g": <int>,
  "fat_g": <int>,
  "fiber_g": <int>,
  "sugar_limit_g": <int>,
  "sodium_limit_mg": <int>,
  "water_ml": <int>,
  "key_nutrients": [
    {{"name": "Vitamin B12", "status": "Low|Normal|Needs attention", "reason": "why for this user", "foods": ["food1","food2","food3"]}},
    {{"name": "Iron", "status": "...", "reason": "...", "foods": ["..."]}},
    {{"name": "Vitamin D", "status": "...", "reason": "...", "foods": ["..."]}},
    {{"name": "Calcium", "status": "...", "reason": "...", "foods": ["..."]}},
    {{"name": "Potassium", "status": "...", "reason": "...", "foods": ["..."]}}
  ],
  "meal_plan": [
    {{"time": "08:00", "name": "Breakfast", "items": ["item1","item2"], "calories": 400, "notes": "why this meal"}},
    {{"time": "13:00", "name": "Lunch", "items": ["..."], "calories": 550, "notes": "..."}},
    {{"time": "17:00", "name": "Snack", "items": ["..."], "calories": 150, "notes": "..."}},
    {{"time": "20:00", "name": "Dinner", "items": ["..."], "calories": 500, "notes": "..."}}
  ],
  "foods_to_increase": ["item1","item2","item3","item4","item5"],
  "foods_to_limit": ["item1","item2","item3"],
  "personalized_tips": [
    "tip 1 — specific to this user's conditions",
    "tip 2",
    "tip 3",
    "tip 4"
  ]
}}

Rules:
- If user has diabetes: emphasize low-glycemic foods, high fiber, limit sugar.
- If user has hypertension: emphasize potassium-rich foods (banana, spinach), low sodium.
- If user has anemia: emphasize iron-rich foods (spinach, jaggery, dates).
- If user has high cholesterol: emphasize soluble fiber (oats, beans), healthy fats.
- Use Indian foods primarily (roti, dal, sabzi, curd, idli, dosa, poha, upma, etc.)
- If vegetarian, do NOT include meat/fish/eggs.
- All values are for ONE day.

Return ONLY the JSON object. No markdown fences. No commentary.
"""

    response = _client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=3000,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    return {"status": "ok", "plan": json.loads(raw)}


@router.post("/api/nutrition/analyze-meal")
def analyze_meal(input: FoodLogInput):
    """Analyze a meal the user logged and give feedback."""

    targets_txt = ""
    if input.daily_targets:
        t = input.daily_targets
        targets_txt = (
            f"\nDAILY TARGETS:\n"
            f"- Calories: {t.get('daily_calories')}\n"
            f"- Protein: {t.get('protein_g')}g\n"
            f"- Carbs: {t.get('carbs_g')}g\n"
            f"- Fat: {t.get('fat_g')}g\n"
            f"- Fiber: {t.get('fiber_g')}g\n"
            f"- Sugar limit: {t.get('sugar_limit_g')}g\n"
            f"- Sodium limit: {t.get('sodium_limit_mg')}mg"
        )

    conditions_txt = (
        f"\nCONDITIONS: {', '.join(input.conditions)}"
        if input.conditions
        else ""
    )

    prompt = f"""You are HEALAC's nutrition AI. Analyze this meal and give feedback.

MEAL: {input.meal_text}{conditions_txt}{targets_txt}

Return ONE JSON object with EXACTLY this structure:
{{
  "calories": <int>,
  "protein_g": <float>,
  "carbs_g": <float>,
  "fat_g": <float>,
  "fiber_g": <float>,
  "sugar_g": <float>,
  "sodium_mg": <float>,
  "glycemic_impact": "<Low|Medium|High>",
  "positives": ["what's good about this meal"],
  "concerns": ["what's not ideal — specific to the conditions"],
  "suggestions": ["2-3 concrete improvements for next time"],
  "verdict": "<one sentence overall assessment>"
}}

Rules:
- Base estimates on typical Indian portion sizes.
- Be honest but kind.
- If conditions include diabetes: flag high-glycemic items.
- If conditions include hypertension: flag high-sodium items.

Return ONLY the JSON object. No markdown.
"""

    response = _client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=1500,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    return {"status": "ok", "analysis": json.loads(raw)}