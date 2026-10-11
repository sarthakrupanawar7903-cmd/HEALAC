"use client";

import { useEffect, useState } from "react";
import {
  Utensils,
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Send,
  Apple,
  Flame,
  Droplet,
  Wheat,
} from "lucide-react";
import { api } from "@/lib/api";

interface Profile {
  name: string;
  age: number;
  gender: string;
  weight_kg: number;
  height_cm: number;
  activity_level: string;
  diet_type: string;
  conditions: string[];
  goal: string;
  wake_time: string;
  sleep_time: string;
  meals_per_day: number;
  allergies: string[];
}

interface Nutrient {
  name: string;
  status: string;
  reason: string;
  foods: string[];
}

interface MealPlanItem {
  time: string;
  name: string;
  items: string[];
  calories: number;
  notes: string;
}

interface Plan {
  bmi: number;
  bmi_category: string;
  daily_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_limit_g: number;
  sodium_limit_mg: number;
  water_ml: number;
  key_nutrients: Nutrient[];
  meal_plan: MealPlanItem[];
  foods_to_increase: string[];
  foods_to_limit: string[];
  personalized_tips: string[];
}

interface Analysis {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  glycemic_impact: string;
  positives: string[];
  concerns: string[];
  suggestions: string[];
  verdict: string;
}

const DEFAULT_PROFILE: Profile = {
  name: "",
  age: 30,
  gender: "Male",
  weight_kg: 70,
  height_cm: 170,
  activity_level: "Moderate",
  diet_type: "Vegetarian",
  conditions: [],
  goal: "Maintain weight",
  wake_time: "07:00",
  sleep_time: "23:00",
  meals_per_day: 3,
  allergies: [],
};

const COMMON_CONDITIONS = [
  "Diabetes",
  "Hypertension",
  "High cholesterol",
  "Anemia",
  "Thyroid",
  "PCOS",
  "Obesity",
];

/* -------- Normalize LLM output -------- */

function asArr<T>(v: any, fallback: T[] = []): T[] {
  return Array.isArray(v) ? v : fallback;
}

function asNum(v: any, fallback = 0): number {
  const n = Number(v);
  return isNaN(n) ? fallback : n;
}

function asStr(v: any, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function normalizeNutrient(n: any): Nutrient {
  return {
    name: asStr(n?.name, "Nutrient"),
    status: asStr(n?.status, "Normal"),
    reason: asStr(n?.reason, ""),
    foods: asArr<string>(n?.foods, []).map((f) => asStr(f)),
  };
}

function normalizeMeal(m: any): MealPlanItem {
  return {
    time: asStr(m?.time, ""),
    name: asStr(m?.name, "Meal"),
    items: asArr<any>(m?.items, []).map((i) =>
      typeof i === "string" ? i : asStr(i?.name || i?.item, String(i))
    ),
    calories: asNum(m?.calories, 0),
    notes: asStr(m?.notes, ""),
  };
}

function normalizePlan(raw: any): Plan {
  return {
    bmi: asNum(raw?.bmi, 0),
    bmi_category: asStr(raw?.bmi_category, "Unknown"),
    daily_calories: asNum(raw?.daily_calories, 2000),
    protein_g: asNum(raw?.protein_g, 0),
    carbs_g: asNum(raw?.carbs_g, 0),
    fat_g: asNum(raw?.fat_g, 0),
    fiber_g: asNum(raw?.fiber_g, 0),
    sugar_limit_g: asNum(raw?.sugar_limit_g, 0),
    sodium_limit_mg: asNum(raw?.sodium_limit_mg, 0),
    water_ml: asNum(raw?.water_ml, 2000),
    key_nutrients: asArr<any>(raw?.key_nutrients, []).map(normalizeNutrient),
    meal_plan: asArr<any>(raw?.meal_plan, []).map(normalizeMeal),
    foods_to_increase: asArr<any>(raw?.foods_to_increase, []).map((f) =>
      asStr(f)
    ),
    foods_to_limit: asArr<any>(raw?.foods_to_limit, []).map((f) => asStr(f)),
    personalized_tips: asArr<any>(raw?.personalized_tips, []).map((t) =>
      asStr(t)
    ),
  };
}

function normalizeAnalysis(raw: any): Analysis {
  return {
    calories: asNum(raw?.calories, 0),
    protein_g: asNum(raw?.protein_g, 0),
    carbs_g: asNum(raw?.carbs_g, 0),
    fat_g: asNum(raw?.fat_g, 0),
    fiber_g: asNum(raw?.fiber_g, 0),
    sugar_g: asNum(raw?.sugar_g, 0),
    sodium_mg: asNum(raw?.sodium_mg, 0),
    glycemic_impact: asStr(raw?.glycemic_impact, "Unknown"),
    positives: asArr<any>(raw?.positives, []).map((p) => asStr(p)),
    concerns: asArr<any>(raw?.concerns, []).map((c) => asStr(c)),
    suggestions: asArr<any>(raw?.suggestions, []).map((s) => asStr(s)),
    verdict: asStr(raw?.verdict, ""),
  };
}

/* -------- Main component -------- */

export default function NutritionPage() {
  const [step, setStep] = useState<"loading" | "questionnaire" | "plan">(
    "loading"
  );
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [mealText, setMealText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("healac_nutrition_profile");
      const savedPlan = localStorage.getItem("healac_nutrition_plan");
      if (savedProfile && savedPlan) {
        setProfile(JSON.parse(savedProfile));
        setPlan(normalizePlan(JSON.parse(savedPlan)));
        setStep("plan");
      } else {
        setStep("questionnaire");
      }
    } catch {
      setStep("questionnaire");
    }
  }, []);

  async function generatePlan() {
    setGenerating(true);
    try {
      const res = await api.post("/api/nutrition/plan", {
        ...profile,
        patient_id: "mock_abha_12345",
      });
      const normalized = normalizePlan(res.data.plan);
      setPlan(normalized);
      localStorage.setItem(
        "healac_nutrition_profile",
        JSON.stringify(profile)
      );
      localStorage.setItem("healac_nutrition_plan", JSON.stringify(normalized));
      setStep("plan");
    } catch (e: any) {
      alert("Failed to generate plan: " + (e.message || "unknown error"));
    } finally {
      setGenerating(false);
    }
  }

  async function analyzeMeal() {
    if (!mealText.trim() || !plan) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await api.post("/api/nutrition/analyze-meal", {
        patient_id: "mock_abha_12345",
        meal_text: mealText,
        conditions: profile.conditions,
        daily_targets: {
          daily_calories: plan.daily_calories,
          protein_g: plan.protein_g,
          carbs_g: plan.carbs_g,
          fat_g: plan.fat_g,
          fiber_g: plan.fiber_g,
          sugar_limit_g: plan.sugar_limit_g,
          sodium_limit_mg: plan.sodium_limit_mg,
        },
      });
      setAnalysis(normalizeAnalysis(res.data.analysis));
    } catch (e: any) {
      alert("Analysis failed: " + (e.message || "unknown error"));
    } finally {
      setAnalyzing(false);
    }
  }

  function reset() {
    localStorage.removeItem("healac_nutrition_profile");
    localStorage.removeItem("healac_nutrition_plan");
    setProfile(DEFAULT_PROFILE);
    setPlan(null);
    setAnalysis(null);
    setMealText("");
    setStep("questionnaire");
  }

  if (step === "loading") {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="animate-spin" size={18} /> Loading...
      </div>
    );
  }

  /* -------- Questionnaire -------- */
  if (step === "questionnaire") {
    return (
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Your Nutrition Profile</h1>
        <p className="text-gray-500 mb-8">
          Answer a few questions and we'll generate a personalized daily plan.
        </p>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Your name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="e.g. Ramesh Kumar"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Age
              </label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) =>
                  setProfile({ ...profile, age: Number(e.target.value) })
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Weight (kg)
              </label>
              <input
                type="number"
                value={profile.weight_kg}
                onChange={(e) =>
                  setProfile({ ...profile, weight_kg: Number(e.target.value) })
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Height (cm)
              </label>
              <input
                type="number"
                value={profile.height_cm}
                onChange={(e) =>
                  setProfile({ ...profile, height_cm: Number(e.target.value) })
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Gender
            </label>
            <select
              value={profile.gender}
              onChange={(e) =>
                setProfile({ ...profile, gender: e.target.value })
              }
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Diet type
            </label>
            <select
              value={profile.diet_type}
              onChange={(e) =>
                setProfile({ ...profile, diet_type: e.target.value })
              }
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option>Vegetarian</option>
              <option>Non-vegetarian</option>
              <option>Vegan</option>
              <option>Eggetarian</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Activity level
            </label>
            <select
              value={profile.activity_level}
              onChange={(e) =>
                setProfile({ ...profile, activity_level: e.target.value })
              }
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option>Sedentary</option>
              <option>Light</option>
              <option>Moderate</option>
              <option>Active</option>
              <option>Very active</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Existing conditions (select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_CONDITIONS.map((c) => {
                const active = profile.conditions.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      setProfile({
                        ...profile,
                        conditions: active
                          ? profile.conditions.filter((x) => x !== c)
                          : [...profile.conditions, c],
                      })
                    }
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      active
                        ? "bg-teal-700 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Your goal
            </label>
            <select
              value={profile.goal}
              onChange={(e) =>
                setProfile({ ...profile, goal: e.target.value })
              }
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option>Maintain weight</option>
              <option>Lose weight</option>
              <option>Gain weight</option>
              <option>Manage a condition</option>
              <option>Build muscle</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Wake time
              </label>
              <input
                type="time"
                value={profile.wake_time}
                onChange={(e) =>
                  setProfile({ ...profile, wake_time: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Sleep time
              </label>
              <input
                type="time"
                value={profile.sleep_time}
                onChange={(e) =>
                  setProfile({ ...profile, sleep_time: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Meals/day
              </label>
              <input
                type="number"
                value={profile.meals_per_day}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    meals_per_day: Number(e.target.value),
                  })
                }
                min={2}
                max={6}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>
        </div>

        <button
          onClick={generatePlan}
          disabled={generating}
          className="mt-6 w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold hover:bg-teal-800 disabled:opacity-50 flex items-center justify-center gap-2 transition"
        >
          {generating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating your plan...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate My Nutrition Plan
            </>
          )}
        </button>
      </div>
    );
  }

  /* -------- Plan view -------- */
  if (!plan) return null;

  const totalCal = plan.meal_plan.reduce((a, m) => a + m.calories, 0);

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            {profile.name ? `${profile.name}'s` : "Your"} Nutrition Plan
          </h1>
          <p className="text-gray-500">
            AI-personalized for your goals and conditions
          </p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-700 border border-gray-200 rounded-xl px-3 py-2"
        >
          <RefreshCw size={14} /> Rebuild
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="BMI"
          value={plan.bmi.toFixed(1)}
          sub={plan.bmi_category}
          icon={Apple}
          accent="teal"
        />
        <StatCard
          label="Calories"
          value={plan.daily_calories.toLocaleString()}
          sub="per day"
          icon={Flame}
          accent="orange"
        />
        <StatCard
          label="Protein"
          value={`${plan.protein_g}g`}
          sub={`Carbs ${plan.carbs_g}g · Fat ${plan.fat_g}g`}
          icon={Wheat}
          accent="purple"
        />
        <StatCard
          label="Water"
          value={`${(plan.water_ml / 1000).toFixed(1)}L`}
          sub="per day"
          icon={Droplet}
          accent="blue"
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Daily Targets
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
          <TargetItem label="Fiber" value={`${plan.fiber_g}g`} />
          <TargetItem label="Sugar limit" value={`${plan.sugar_limit_g}g`} />
          <TargetItem label="Sodium" value={`${plan.sodium_limit_mg}mg`} />
          <TargetItem label="Protein" value={`${plan.protein_g}g`} />
          <TargetItem label="Carbs" value={`${plan.carbs_g}g`} />
          <TargetItem label="Fat" value={`${plan.fat_g}g`} />
        </div>
      </div>

      {plan.key_nutrients.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Key Nutrients to Watch
          </h2>
          <div className="space-y-4">
            {plan.key_nutrients.map((n, i) => {
              const color =
                n.status === "Low"
                  ? "border-red-100 bg-red-50"
                  : n.status === "Needs attention"
                  ? "border-amber-100 bg-amber-50"
                  : "border-emerald-100 bg-emerald-50";
              const iconColor =
                n.status === "Low"
                  ? "text-red-600"
                  : n.status === "Needs attention"
                  ? "text-amber-600"
                  : "text-emerald-600";
              const Icon =
                n.status === "Normal" ? CheckCircle2 : AlertTriangle;
              return (
                <div key={i} className={`border rounded-xl p-4 ${color}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Icon
                      size={18}
                      className={`${iconColor} mt-0.5 shrink-0`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {n.name}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-medium ${iconColor} bg-white`}
                        >
                          {n.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">{n.reason}</div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {n.foods.map((f, j) => (
                          <span
                            key={j}
                            className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded-md"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {plan.meal_plan.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Today's Meal Plan
            </h2>
            <span className="text-sm text-gray-500">
              Total: {totalCal} kcal
            </span>
          </div>
          <div className="space-y-4">
            {plan.meal_plan.map((m, i) => (
              <div key={i} className="border-l-4 border-teal-600 pl-4 py-2">
                <div className="flex items-center gap-3 mb-2">
                  {m.time && (
                    <span className="text-sm font-semibold text-teal-700">
                      {m.time}
                    </span>
                  )}
                  <span className="font-bold text-gray-900">{m.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {m.calories} kcal
                  </span>
                </div>
                {m.items.length > 0 && (
                  <ul className="text-sm text-gray-700 space-y-1 mb-2">
                    {m.items.map((item, j) => (
                      <li key={j}>• {item}</li>
                    ))}
                  </ul>
                )}
                {m.notes && (
                  <div className="text-xs text-gray-500 italic">
                    {m.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <h3 className="font-bold text-emerald-900">Increase intake</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {plan.foods_to_increase.length > 0 ? (
              plan.foods_to_increase.map((f, i) => (
                <span
                  key={i}
                  className="bg-white text-emerald-800 border border-emerald-200 text-sm px-3 py-1.5 rounded-lg"
                >
                  {f}
                </span>
              ))
            ) : (
              <span className="text-sm text-emerald-700">
                No specific recommendations
              </span>
            )}
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-600" />
            <h3 className="font-bold text-red-900">Limit or avoid</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {plan.foods_to_limit.length > 0 ? (
              plan.foods_to_limit.map((f, i) => (
                <span
                  key={i}
                  className="bg-white text-red-800 border border-red-200 text-sm px-3 py-1.5 rounded-lg"
                >
                  {f}
                </span>
              ))
            ) : (
              <span className="text-sm text-red-700">
                No specific restrictions
              </span>
            )}
          </div>
        </div>
      </div>

      {plan.personalized_tips.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-teal-700" />
            <h2 className="text-lg font-bold text-gray-900">
              Personalized Tips
            </h2>
          </div>
          <div className="space-y-2">
            {plan.personalized_tips.map((t, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-sm text-gray-700"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Utensils size={18} className="text-teal-700" />
          <h2 className="text-lg font-bold text-gray-900">
            Log a meal — get instant feedback
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Type what you ate. We'll analyze it against your targets and
          conditions.
        </p>

        <div className="flex gap-2 mb-4">
          <input
            value={mealText}
            onChange={(e) => setMealText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyzeMeal()}
            placeholder="e.g. 2 rotis, dal, salad, 1 cup curd"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            disabled={analyzing}
          />
          <button
            onClick={analyzeMeal}
            disabled={!mealText.trim() || analyzing}
            className="bg-teal-700 text-white px-5 rounded-xl font-semibold hover:bg-teal-800 disabled:opacity-50 transition flex items-center gap-2"
          >
            {analyzing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Analyze
          </button>
        </div>

        {analysis && (
          <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              <Metric label="Calories" value={`${analysis.calories}`} />
              <Metric label="Protein" value={`${analysis.protein_g}g`} />
              <Metric label="Carbs" value={`${analysis.carbs_g}g`} />
              <Metric label="Fat" value={`${analysis.fat_g}g`} />
              <Metric label="Fiber" value={`${analysis.fiber_g}g`} />
              <Metric label="Sugar" value={`${analysis.sugar_g}g`} />
            </div>

            <div
              className={`text-sm font-medium px-3 py-2 rounded-lg inline-block ${
                analysis.glycemic_impact === "Low"
                  ? "bg-emerald-50 text-emerald-700"
                  : analysis.glycemic_impact === "Medium"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              Glycemic impact: {analysis.glycemic_impact}
            </div>

            {analysis.verdict && (
              <div>
                <div className="text-sm font-bold text-gray-900 mb-2">
                  Verdict
                </div>
                <p className="text-sm text-gray-700">{analysis.verdict}</p>
              </div>
            )}

            {analysis.positives.length > 0 && (
              <div>
                <div className="text-sm font-bold text-emerald-700 mb-2">
                  ✓ Good
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {analysis.positives.map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.concerns.length > 0 && (
              <div>
                <div className="text-sm font-bold text-amber-700 mb-2">
                  ⚠ Watch out
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {analysis.concerns.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.suggestions.length > 0 && (
              <div>
                <div className="text-sm font-bold text-teal-700 mb-2">
                  💡 Suggestions
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {analysis.suggestions.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 text-xs text-gray-400 text-center">
        AI-generated nutrition guidance for informational purposes only. Not a
        substitute for professional dietary advice.
      </div>
    </div>
  );
}

/* -------- Sub-components -------- */

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: any;
  accent: "teal" | "orange" | "purple" | "blue";
}) {
  const colorMap = {
    teal: "bg-emerald-50 text-teal-700",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[accent]}`}
      >
        <Icon size={20} />
      </div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );
}

function TargetItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg p-2 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-bold text-gray-900">{value}</div>
    </div>
  );
}