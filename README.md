<div align="center">

# 🧬 HEALAC

### AI-Powered Personal Health Copilot

**Your health, illuminated.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-healac.vercel.app-0A5C5C?style=for-the-badge&logo=vercel)](https://healac.vercel.app/)
[![API](https://img.shields.io/badge/API-healac.onrender.com-10B981?style=for-the-badge)](https://healac.onrender.com)
[![Docs](https://img.shields.io/badge/API%20Docs-Swagger-FF6B5B?style=for-the-badge)](https://healac.onrender.com/docs)

Built for the **byteXL × Kampus.VC Hackathon 2026**
Challenge: *AI-Powered Personal Health Copilot* — sponsored by Altrix Labs

**Team:** Atlas SkillTech University

</div>

---

## 🎥 What Is HEALAC?

HEALAC turns messy, fragmented medical records into clear, actionable health insights. Upload a prescription, lab report, or discharge summary — our AI pipeline extracts medicines, dosages, lab values, and diagnoses, explains them in plain language, and organizes everything into a unified health timeline.

**The problem:** 99% of Indian medical documentation is written in English, using jargon that patients can't understand. Records live across prescriptions, lab reports, and discharge summaries that never talk to each other. Patients miss medication adjustments, misinterpret abnormal values, and repeat their entire history to every new doctor.

**The solution:** HEALAC — a multilingual AI copilot that reads, understands, and explains your health in your language.

---

## 🔗 Live Deployment

| Service | URL |
|---------|-----|
| 🌐 **Frontend** | **[healac.vercel.app](https://healac.vercel.app/)** |
| ⚙️ **Backend API** | [healac.onrender.com](https://healac.onrender.com) |
| 📘 **Interactive API Docs** | [healac.onrender.com/docs](https://healac.onrender.com/docs) |

> ⚠️ **Note:** The backend runs on Render's free tier. The first request after 15 minutes of inactivity takes 30–60 seconds to spin up. Subsequent requests are fast (~5–10 seconds end-to-end).

---

## ✨ Feature Highlights

### 🎯 Core Requirements 

<table>
<tr>
<td width="50%">

**1. Medical Record Intelligence & OCR**
- Tesseract OCR engine extracts raw text from prescriptions, lab reports, and discharge summaries
- Handles printed documents with high accuracy; handwritten prescriptions supported via LLM-based error correction
- Automatically upscales small images for better OCR
- Extracts: medicines, dosages, frequencies, test values, reference ranges, diagnoses, dates, facility names

</td>
<td width="50%">

**2. AI Health Summary in Plain Language**
- Complex medical values explained at a 6th-grade reading level
- Abnormal values flagged and explained (e.g., *"Your HbA1c is 8.2, which is high — this means your average blood sugar over 3 months has been too high"*)
- Safe wording enforced via system prompt: never diagnoses, never prescribes, always disclaims
- Simultaneously generated in **English + Hindi**

</td>
</tr>
<tr>
<td>

**3. Unified Health Profile & Timeline**
- Every upload stored in SQLite with full FHIR-mapped JSON
- Chronological timeline of all records
- Click any record to view its full summary
- Trend analysis compares current values against historical data

</td>
<td>

**4. ABDM/ABHA Readiness**
- Data model follows **HL7 FHIR R4** standards: `DiagnosticReport`, `MedicationRequest`, `Condition`
- Schema contract published in `backend/schema/contract.json`
- Mock ABHA ID linked to every record (`mock_abha_12345`)
- Ready for ABDM sandbox integration

</td>
</tr>
</table>

### 🚀 Bonus & Beyond

| Feature | Description |
|---------|-------------|
| 🌍 **Multi-Language Support** | Hindi (Devanagari), Marathi, Gujarati, Tamil, Telugu — summaries and interface |
| ⌚ **Smartwatch Dashboard** | 5-day health metrics: heart rate, steps, hydration, sleep, SpO2, stress. Interactive charts, clickable metric cards, and AI-generated trend insights |
| 🥗 **AI Nutrition Planner** | Personalized daily plan based on age, weight, conditions, and goals. Includes BMI, calorie targets, key nutrient alerts (Vitamin B12, Iron, etc.), Indian meal plan, and per-meal AI feedback |
| 🤖 **AI Symptom Checker** | Conversational chat that asks follow-up questions before suggesting possibilities. Reads patient history from uploaded records |
| 👤 **Editable Profile** | Name, age, gender, language, ABHA ID — synced across the app |
| 📞 **Health Resources** | Indian emergency helplines (112, 108, Tele-MANAS), government schemes (Ayushman Bharat, ABHA), and health guides |
| 🔗 **Device Pairing** | Mock Bluetooth discovery with real-time scanning animation and device pairing flow |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    USER UPLOAD (JPG / PNG / PDF)                 │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    TESSERACT OCR  (Docker)                       │
│  • Local OCR engine — no external API calls                      │
│  • Image upscaling for small documents                           │
│  • Extracts raw text from printed & handwritten medical records  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│              GROQ LLM  (openai/gpt-oss-120b · Llama 3)           │
│  • Parses OCR text into strict JSON                              │
│  • Maps to FHIR resources                                        │
│  • Generates plain-language summary + Hindi translation          │
│  • Trend analysis · Drug interactions · Doctor questions         │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│              FASTAPI BACKEND  (Python 3.12)                      │
│  • /api/upload           → OCR + LLM + DB write                  │
│  • /api/records          → List + fetch health records           │
│  • /api/chat             → Conversational symptom checker        │
│  • /api/watch/*          → Smartwatch data + device pairing      │
│  • /api/nutrition/*      → AI nutrition plan + meal analysis     │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│              SQLITE DATABASE  (SQLAlchemy ORM)                   │
│  • Records table with JSON columns for FHIR + AI insights        │
│  • Indexed by patient_id · Chronological queries                 │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│           NEXT.JS 14 FRONTEND  (Vercel)                          │
│  • App Router · TypeScript · Tailwind CSS · Lucide icons         │
│  • Sidebar navigation · Upload → Summary → Timeline flow         │
│  • Responsive, animated, multilingual                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Complete Tech Stack

### Artificial Intelligence & Machine Learning

| Technology | Role in HEALAC |
|-----------|---------------|
| **Groq LLM** (`openai/gpt-oss-120b`, Llama-3 architecture) | Structured extraction, plain-language summarization, Hindi translation, conversational symptom checker, nutrition plan generation |
| **Tesseract OCR** | Local OCR engine — extracts text from printed and handwritten medical documents |
| **XGBoost** | Gradient-boosted model for chronic disease risk prediction (diabetes + cardiovascular) |
| **Random Forest** | Ensemble classifier — cross-validates risk predictions with XGBoost |
| **scikit-learn** | Feature engineering, model training pipeline, train/test split, ROC-AUC evaluation |
| **pandas + NumPy** | Feature vectorization, trend analysis, longitudinal lab data processing |

### Backend

| Technology | Purpose |
|-----------|---------|
| **FastAPI** | Async Python REST API with automatic OpenAPI 3.1 spec |
| **Swagger UI** | Auto-generated interactive API documentation at `/docs` |
| **Uvicorn** | ASGI server |
| **SQLAlchemy 2.0** | ORM for SQLite with JSON column support |
| **Pydantic v2** | Request/response validation, LLM output normalization |
| **Pillow** | Image preprocessing for OCR |
| **python-dotenv** | Environment configuration |

### Frontend

| Technology | Purpose |
|-----------|---------|
| **Next.js 14** (App Router) | React framework with server components |
| **React 18** | Component architecture |
| **TypeScript** | End-to-end type safety |
| **Tailwind CSS** | Utility-first styling, custom theme system |
| **Lucide React** | Icon library |
| **Axios** | HTTP client with timeout + interceptors |
| **localStorage** | Client-side persistence for profile & nutrition plan |

### DevOps & Deployment

| Technology | Purpose |
|-----------|---------|
| **Docker** | Backend containerization with Tesseract pre-installed |
| **Render** | Backend hosting (Docker runtime) |
| **Vercel** | Frontend hosting with edge network |
| **Git + GitHub** | Version control with structured commits |

---

## 📊 ML Pipeline

HEALAC includes a full machine learning pipeline for chronic disease risk prediction, complementing the LLM-based extraction layer.

### Model Training (`backend/ml/train_risk_model.py`)

```python
# Features used (15-dim vector):
# age, bmi, hba1c, fasting_glucose, cholesterol, hdl, ldl,
# triglycerides, systolic_bp, diastolic_bp, family_history,
# smoker, activity_level, stress_level, sleep_hours

model = xgb.XGBClassifier(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.05,
    objective="binary:logistic",
    eval_metric="auc",
)
```

**Pipeline stages:**
1. **Feature engineering** — 15 clinical + lifestyle features (demographics, lab values, lifestyle)
2. **Composite risk labeling** — weighted scoring of diabetes + cardiovascular risk factors
3. **XGBoost training** — gradient boosting with AUC evaluation (~0.92–0.96 on test set)
4. **Random Forest cross-validation** — ensemble agreement check
5. **Feature importance** — top 5 drivers surfaced to the user (e.g., *"HbA1c was the strongest contributor to your risk"*)

**Models integrated with the LLM layer** — risk scores and top feature drivers are included in the health summary presented to the patient.

---

## 📁 Repository Structure

```
HEALAC/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI entry point
│   │   ├── config.py                   # Env loading
│   │   ├── database.py                 # SQLAlchemy + SQLite
│   │   ├── models.py                   # Record ORM model
│   │   ├── schemas.py                  # Pydantic schemas
│   │   ├── routes/
│   │   │   ├── upload.py               # POST /api/upload
│   │   │   ├── records.py              # GET /api/records
│   │   │   ├── chat.py                 # POST /api/chat
│   │   │   ├── watch.py                # Smartwatch routes
│   │   │   └── nutrition.py            # Nutrition routes
│   │   └── services/
│   │       ├── gemini_extractor.py     # OCR + Groq extraction
│   │       ├── gemini_chat.py          # Symptom checker
│   │       ├── fhir_mapper.py          # FHIR R4 mapping
│   │       ├── trend_engine.py         # Longitudinal analysis
│   │       ├── risk_model.py           # XGBoost inference
│   │       ├── interaction_checker.py  # Drug interaction check
│   │       └── utils/prompts.py        # LLM prompts
│   ├── ml/
│   │   ├── train_risk_model.py         # Training pipeline
│   │   └── models/risk_model.xgb       # Trained artifact
│   ├── schema/contract.json            # FHIR-aligned JSON schema
│   ├── requirements.txt
│   └── Dockerfile                      # Tesseract + Python
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                    # Home
│   │   ├── upload/page.tsx             # Document upload
│   │   ├── summary/[id]/page.tsx       # AI summary (English/Hindi)
│   │   ├── timeline/page.tsx           # Health timeline
│   │   ├── chat/page.tsx               # AI chat
│   │   ├── watch/page.tsx              # Smartwatch dashboard
│   │   ├── nutrition/page.tsx          # Nutrition planner
│   │   ├── settings/page.tsx           # Profile
│   │   └── resources/page.tsx          # Health resources
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   └── lib/api.ts                      # Backend client
│
└── README.md
```

---

## 👥 Team — Atlas SkillTech University

| Member | Role | Contributions |
|--------|------|---------------|
| **Sarthak Rupanawar** ⭐ | Team Lead · AI Pipeline & Backend | Gemini/Groq LLM integration, FHIR schema design, XGBoost & Random Forest training, FastAPI architecture, Docker deployment, trend engine |
| **Syed Zainnudin** | AI/ML Engineer · Backend | ML model training & evaluation, OCR pipeline, drug interaction checker, nutrition AI, smartwatch data engine |
| **Nirali Jain** | Frontend & UI/UX Engineer | Next.js architecture, all page components, Tailwind design system, animations, responsive layouts, interactive charts |
| **Avani Shukla** | Research & Documentation | Clinical research, prompt engineering support, health data curation, documentation, user journey design |

---

## 📊 Evaluation Criteria Alignment

| Criterion | Weight | How HEALAC Delivers |
|-----------|--------|---------------------|
| **AI Utilization** | 35% | Two-layer AI pipeline: Tesseract OCR + Groq LLM for extraction; XGBoost + Random Forest + scikit-learn for risk prediction; structured JSON output; Hindi translation; conversational symptom checker |
| **Technical Architecture** | 25% | Clean 4-stage pipeline (OCR → LLM → FHIR → UI); Docker deployment; FastAPI + Swagger; FHIR R4 schema; SQL persistence; typed frontend-backend contract |
| **User Experience** | 20% | Sidebar navigation with 8 sections; upload → summary → timeline flow; English/Hindi toggle; interactive charts; responsive design; multi-language support (5 languages) |
| **Healthcare Impact** | 10% | Plain-language explanations for non-medical users; safe wording enforced via system prompt; mandatory disclaimers; Hindi for accessibility; ABDM-ready |
| **Presentation & Demo** | 10% | Live deployed app with real prescription upload → extraction → summary in under 30 seconds; public Swagger docs; complete GitHub repo |

---

## 🚀 Running Locally

### Prerequisites

- Python 3.12+
- Node.js 20+
- [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki) (Windows installer)
- Groq API key — [console.groq.com/keys](https://console.groq.com/keys)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

pip install -r requirements.txt
```

Create `backend/.env`:

```env
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
DATABASE_URL=sqlite:///./healac.db
OPENFDA_BASE=https://api.fda.gov/drug
```

Run:

```bash
uvicorn app.main:app --reload --port 8000
```

- API: `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

- App: `http://localhost:3000`

### Optional: Train the ML Risk Model

```bash
cd backend
python ml/train_risk_model.py
```

Produces `ml/models/risk_model.xgb` and prints AUC on the test set.

---

## 🔐 Safety & Disclaimers

HEALAC is an **informational tool, not a medical device.**

- It does not provide medical advice, diagnosis, or treatment.
- All AI summaries end with: *"This is an AI-generated summary for informational purposes only. It is not medical advice. Please consult your doctor."*
- Wording is constrained at the prompt level: *"may indicate"*, *"consult your doctor"*, *"possible"* — never *"you have"*, never *"take X mg"*.
- The AI **never recommends dosage changes** and **never diagnoses conditions**.

---

## 🛣️ Roadmap

- [ ] Real ABHA integration via ABDM sandbox
- [ ] Handwritten prescription fine-tuning (custom OCR model)
- [ ] Native Android app for Health Connect (live smartwatch sync)
- [ ] Voice-based health queries (Hindi + regional languages)
- [ ] Family health profiles
- [ ] Doctor-facing portal for record sharing
- [ ] Medication reminders + adherence tracking
- [ ] On-device LLM inference for privacy

---

## 🙏 Acknowledgements

- **Altrix Labs** — for the challenge brief
- **byteXL** & **Kampus.VC** — for the hackathon platform
- **Atlas SkillTech University** — for the opportunity
- **Groq** — for fast LLM inference
- **Tesseract OCR** — for the open-source OCR engine

---

## 📄 License

MIT License — see [LICENSE](./LICENSE).

---

<div align="center">

### **HEALAC** — *Your health, illuminated.*

**🌐 [Live App](https://healac.vercel.app/)** · **⚙️ [Backend](https://healac.onrender.com)** · **📘 [API Docs](https://healac.onrender.com/docs)**

*Built with care at Atlas SkillTech University · 2026*

</div>
