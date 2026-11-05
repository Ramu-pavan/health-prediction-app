"""
Health Prediction Application - SQLite Persistent Database Layer
Handles database schema creation, connection pooling, and CRUD operations.
"""

import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "health_prediction.db")


def get_db_connection():
    """Create a thread-safe connection to the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize the database schema if tables do not already exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            dob TEXT NOT NULL,
            email TEXT NOT NULL,
            glucose REAL NOT NULL,
            haemoglobin REAL NOT NULL,
            cholesterol REAL NOT NULL,
            remarks TEXT NOT NULL,
            risk_level TEXT NOT NULL DEFAULT 'Low',
            prediction_details TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def row_to_dict(row):
    """Convert an SQLite Row object to a clean dictionary."""
    if not row:
        return None
    data = dict(row)
    if data.get("prediction_details"):
        try:
            data["prediction_details"] = json.loads(data["prediction_details"])
        except (json.JSONDecodeError, TypeError):
            pass
    return data


def get_all_patients(search=None, risk_level=None):
    """Retrieve all patient records with optional search and risk level filtering."""
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM patients WHERE 1=1"
    params = []

    if search:
        search_term = f"%{search.strip()}%"
        query += " AND (full_name LIKE ? OR email LIKE ?)"
        params.extend([search_term, search_term])

    if risk_level and risk_level.lower() != "all":
        query += " AND LOWER(risk_level) = LOWER(?)"
        params.append(risk_level)

    query += " ORDER BY id DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [row_to_dict(r) for r in rows]


def get_patient_by_id(patient_id):
    """Fetch a single patient record by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    row = cursor.fetchone()
    conn.close()
    return row_to_dict(row)


def create_patient(full_name, dob, email, glucose, haemoglobin, cholesterol, remarks, risk_level="Low", prediction_details=None):
    """Insert a new validated patient record into the database."""
    now = datetime.utcnow().isoformat()
    prediction_json = json.dumps(prediction_details) if prediction_details else None

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO patients (
            full_name, dob, email, glucose, haemoglobin, cholesterol,
            remarks, risk_level, prediction_details, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        full_name, dob, email, float(glucose), float(haemoglobin), float(cholesterol),
        remarks, risk_level, prediction_json, now, now
    ))
    patient_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return get_patient_by_id(patient_id)


def update_patient(patient_id, full_name, dob, email, glucose, haemoglobin, cholesterol, remarks, risk_level="Low", prediction_details=None):
    """Update an existing patient record."""
    now = datetime.utcnow().isoformat()
    prediction_json = json.dumps(prediction_details) if prediction_details else None

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE patients
        SET full_name = ?, dob = ?, email = ?, glucose = ?, haemoglobin = ?, cholesterol = ?,
            remarks = ?, risk_level = ?, prediction_details = ?, updated_at = ?
        WHERE id = ?
    """, (
        full_name, dob, email, float(glucose), float(haemoglobin), float(cholesterol),
        remarks, risk_level, prediction_json, now, patient_id
    ))
    conn.commit()
    conn.close()

    return get_patient_by_id(patient_id)


def delete_patient(patient_id):
    """Delete a patient record by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM patients WHERE id = ?", (patient_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted


def get_dashboard_stats():
    """Compute aggregate statistical indicators for the dashboard overview."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM patients")
    total_patients = cursor.fetchone()[0]

    cursor.execute("SELECT risk_level, COUNT(*) FROM patients GROUP BY risk_level")
    risk_counts = {row[0]: row[1] for row in cursor.fetchall()}

    cursor.execute("""
        SELECT 
            AVG(glucose) as avg_glucose,
            AVG(haemoglobin) as avg_haemoglobin,
            AVG(cholesterol) as avg_cholesterol
        FROM patients
    """)
    avg_row = cursor.fetchone()

    conn.close()

    return {
        "total_patients": total_patients,
        "risk_breakdown": {
            "Low": risk_counts.get("Low", 0),
            "Moderate": risk_counts.get("Moderate", 0),
            "High": risk_counts.get("High", 0),
            "Critical": risk_counts.get("Critical", 0),
        },
        "averages": {
            "glucose": round(avg_row["avg_glucose"] or 0, 1),
            "haemoglobin": round(avg_row["avg_haemoglobin"] or 0, 1),
            "cholesterol": round(avg_row["avg_cholesterol"] or 0, 1),
        }
    }


def reset_db():
    """Clear all records from patients table (used for test resets)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM patients")
    conn.commit()
    conn.close()
