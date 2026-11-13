
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any
import sqlite3
import json
from datetime import datetime, timezone

app = FastAPI(
    title="MediGuard AI API",
    description="Medication safety prototype backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_NAME = "mediguard.db"


def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS patients (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                age INTEGER,
                patient_data TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id TEXT NOT NULL,
                result_data TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)


initialize_db()


class PatientRequest(BaseModel):
    patient: dict[str, Any]


class AnalysisRequest(BaseModel):
    patient: dict[str, Any]
    result: dict[str, Any]


@app.get("/")
def root():
    return {
        "message": "Welcome to MediGuard AI API",
        "status": "running"
    }


@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "MediGuard AI"}


@app.post("/api/patients")
def save_patient(request: PatientRequest):
    patient = request.patient

    patient_id = patient.get("id")
    name = patient.get("name")

    if not patient_id or not name:
        raise HTTPException(
            status_code=400,
            detail="Patient ID and name are required"
        )

    now = datetime.now(timezone.utc).isoformat()

    with get_db() as conn:
        conn.execute("""
            INSERT OR REPLACE INTO patients
            (id, name, age, patient_data, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (
            patient_id,
            name,
            patient.get("age"),
            json.dumps(patient),
            now
        ))

    return {
        "message": "Patient saved successfully",
        "patient_id": patient_id
    }


@app.get("/api/patients")
def get_patients():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM patients ORDER BY created_at DESC"
        ).fetchall()

    return [
        {
            "id": row["id"],
            "name": row["name"],
            "age": row["age"],
            "patient": json.loads(row["patient_data"]),
            "created_at": row["created_at"]
        }
        for row in rows
    ]


@app.get("/api/patients/{patient_id}")
def get_patient(patient_id: str):
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM patients WHERE id = ?",
            (patient_id,)
        ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Patient not found")

    return {
        "id": row["id"],
        "name": row["name"],
        "age": row["age"],
        "patient": json.loads(row["patient_data"]),
        "created_at": row["created_at"]
    }



@app.post("/api/analyses")
def save_analysis(analysis: dict[str, Any]):
    patient = analysis.get("patient")

    if not isinstance(patient, dict):
        raise HTTPException(status_code=400, detail="Patient details are required")

    patient_id = patient.get("id")
    name = patient.get("name")

    if not patient_id or not name:
        raise HTTPException(
            status_code=400,
            detail="Patient ID and name are required"
        )

    findings = analysis.get("findings")

    if not isinstance(findings, list):
        raise HTTPException(
            status_code=400,
            detail="Findings must be a list"
        )

    if not analysis.get("status"):
        raise HTTPException(
            status_code=400,
            detail="Analysis status is required"
        )

    now = datetime.now(timezone.utc).isoformat()
    created_at = analysis.get("analyzedAt") or now

    with get_db() as conn:
        # Save or update patient details
        conn.execute("""
            INSERT INTO patients
            (id, name, age, patient_data, created_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                age = excluded.age,
                patient_data = excluded.patient_data
        """, (
            patient_id,
            name,
            patient.get("age"),
            json.dumps(patient),
            now
        ))

        # Save the complete AI analysis without changing its structure
        conn.execute("""
            INSERT INTO analyses
            (patient_id, result_data, created_at)
            VALUES (?, ?, ?)
        """, (
            patient_id,
            json.dumps(analysis),
            created_at
        ))

    return {
        "message": "Analysis saved successfully",
        "patient_id": patient_id,
        "findings_count": len(findings),
        "status": analysis["status"],
        "saved_at": now
    }

    patient = request.patient
    result = request.result

    patient_id = patient.get("id")

    if not patient_id:
        raise HTTPException(status_code=400, detail="Patient ID required")

    now = datetime.now(timezone.utc).isoformat()

    with get_db() as conn:
        conn.execute("""
            INSERT INTO analyses
            (patient_id, result_data, created_at)
            VALUES (?, ?, ?)
        """, (
            patient_id,
            json.dumps(result),
            now
        ))

    return {
        "message": "Analysis saved successfully",
        "patient_id": patient_id,
        "saved_at": now
    }


@app.get("/api/analyses")
def get_analyses():
    with get_db() as conn:
        rows = conn.execute("""
            SELECT * FROM analyses ORDER BY created_at DESC
        """).fetchall()

    return [
        {
            "id": row["id"],
            "patient_id": row["patient_id"],
            "result": json.loads(row["result_data"]),
            "created_at": row["created_at"]
        }
        for row in rows
    ]


@app.get("/api/analyses/{patient_id}")
def get_patient_analyses(patient_id: str):
    with get_db() as conn:
        rows = conn.execute("""
            SELECT * FROM analyses
            WHERE patient_id = ?
            ORDER BY created_at DESC
        """, (patient_id,)).fetchall()

    return [
        {
            "id": row["id"],
            "patient_id": row["patient_id"],
            "result": json.loads(row["result_data"]),
            "created_at": row["created_at"]
        }
        for row in rows
    ]
