"""HEALAC FastAPI backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routes import upload, records, chat, watch, nutrition

app = FastAPI(title="HEALAC API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


app.include_router(upload.router, tags=["Upload"])
app.include_router(records.router, tags=["Records"])
app.include_router(chat.router, tags=["Chat"])
app.include_router(watch.router, tags=["Watch"])
app.include_router(nutrition.router, tags=["Nutrition"])


@app.get("/")
def root():
    return {"status": "ok", "service": "HEALAC"}