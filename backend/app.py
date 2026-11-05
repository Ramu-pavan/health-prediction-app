"""
Health Prediction Application - Main REST API Server
Built with Python Flask, SQLite persistent storage, and AI Clinical Risk Engine.
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from database import (
    init_db,
    get_all_patients,
    get_patient_by_id,
    create_patient,
    update_patient,
    delete_patient,
    get_dashboard_stats,
    reset_db
)
from validator import validate_patient_record, parse_and_validate_date, validate_email_address, validate_numeric_lab_value
from ai_service import generate_external_ai_prediction
from test_dataset import ASSESSMENT_ENTRIES, run_assessment_validation

app = Flask(__name__)
# Enable CORS for frontend integration across all origins
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Ensure database is initialized at startup
init_db()


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint to verify backend status and version."""
    return jsonify({
        "status": "online",
        "service": "Health Prediction API",
        "version": "1.0.0",
        "ai_engine": "Clinical Intelligence Decision Engine v2.4 (Active)"
    }), 200


@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Returns aggregated dashboard statistics."""
    try:
        stats = get_dashboard_stats()
        return jsonify({"status": "success", "data": stats}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/patients", methods=["GET"])
def list_patients():
    """
    Get all patient records.
    Query parameters:
    - search: string (matches name or email)
    - risk_level: string (Low, Moderate, High, Critical)
    """
    try:
        search = request.args.get("search", None)
        risk_level = request.args.get("risk_level", None)
        patients = get_all_patients(search=search, risk_level=risk_level)
        return jsonify({
            "status": "success",
            "count": len(patients),
            "data": patients
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/patients/<int:patient_id>", methods=["GET"])
def get_patient(patient_id):
    """Retrieve single patient record by ID."""
    patient = get_patient_by_id(patient_id)
    if not patient:
        return jsonify({"status": "error", "message": f"Patient with ID {patient_id} not found."}), 404
    return jsonify({"status": "success", "data": patient}), 200


@app.route("/api/patients/validate", methods=["POST"])
def dry_run_validate():
    """
    Endpoint for client-side dry-run validation.
    Returns field-by-field validation results without persisting to database.
    """
    data = request.get_json() or {}
    is_valid, cleaned, errors = validate_patient_record(data)
    
    prediction = None
    if is_valid:
        remarks, risk_level, details = generate_external_ai_prediction(
            full_name=cleaned["full_name"],
            age=cleaned["age"],
            glucose=cleaned["glucose"],
            haemoglobin=cleaned["haemoglobin"],
            cholesterol=cleaned["cholesterol"]
        )
        prediction = {
            "remarks": remarks,
            "risk_level": risk_level,
            "details": details
        }

    return jsonify({
        "is_valid": is_valid,
        "errors": errors,
        "cleaned_data": cleaned if is_valid else None,
        "preview_prediction": prediction
    }), 200


@app.route("/api/patients", methods=["POST"])
def add_patient():
    """
    Create a new patient record.
    Performs strict validation; if valid, generates AI disease risk prediction
    and remarks before saving to the database.
    """
    data = request.get_json() or {}
    
    # 1. Validation
    is_valid, cleaned, errors = validate_patient_record(data)
    if not is_valid:
        return jsonify({
            "status": "error",
            "message": f"Validation failed for {len(errors)} field(s).",
            "errors": errors
        }), 422

    # 2. Trigger AI / Health Prediction Model
    api_key = data.get("api_key") or request.headers.get("X-AI-API-Key")
    remarks, risk_level, prediction_details = generate_external_ai_prediction(
        full_name=cleaned["full_name"],
        age=cleaned["age"],
        glucose=cleaned["glucose"],
        haemoglobin=cleaned["haemoglobin"],
        cholesterol=cleaned["cholesterol"],
        api_key=api_key
    )

    # 3. Save to Persistent Database
    try:
        new_patient = create_patient(
            full_name=cleaned["full_name"],
            dob=cleaned["dob"],
            email=cleaned["email"],
            glucose=cleaned["glucose"],
            haemoglobin=cleaned["haemoglobin"],
            cholesterol=cleaned["cholesterol"],
            remarks=remarks,
            risk_level=risk_level,
            prediction_details=prediction_details
        )
        return jsonify({
            "status": "success",
            "message": f"Patient record for '{cleaned['full_name']}' created successfully.",
            "data": new_patient
        }), 201
    except Exception as e:
        return jsonify({"status": "error", "message": f"Database insertion failed: {str(e)}"}), 500


@app.route("/api/patients/<int:patient_id>", methods=["PUT"])
def edit_patient(patient_id):
    """
    Update an existing patient record.
    Re-validates data and recomputes AI remarks.
    """
    existing = get_patient_by_id(patient_id)
    if not existing:
        return jsonify({"status": "error", "message": f"Patient with ID {patient_id} not found."}), 404

    data = request.get_json() or {}
    is_valid, cleaned, errors = validate_patient_record(data)
    if not is_valid:
        return jsonify({
            "status": "error",
            "message": f"Validation failed for {len(errors)} field(s).",
            "errors": errors
        }), 422

    # Recalculate AI Prediction
    api_key = data.get("api_key") or request.headers.get("X-AI-API-Key")
    remarks, risk_level, prediction_details = generate_external_ai_prediction(
        full_name=cleaned["full_name"],
        age=cleaned["age"],
        glucose=cleaned["glucose"],
        haemoglobin=cleaned["haemoglobin"],
        cholesterol=cleaned["cholesterol"],
        api_key=api_key
    )

    try:
        updated = update_patient(
            patient_id=patient_id,
            full_name=cleaned["full_name"],
            dob=cleaned["dob"],
            email=cleaned["email"],
            glucose=cleaned["glucose"],
            haemoglobin=cleaned["haemoglobin"],
            cholesterol=cleaned["cholesterol"],
            remarks=remarks,
            risk_level=risk_level,
            prediction_details=prediction_details
        )
        return jsonify({
            "status": "success",
            "message": f"Patient record #{patient_id} updated successfully.",
            "data": updated
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": f"Database update failed: {str(e)}"}), 500


@app.route("/api/patients/<int:patient_id>", methods=["DELETE"])
def remove_patient(patient_id):
    """Delete a patient record by ID."""
    existing = get_patient_by_id(patient_id)
    if not existing:
        return jsonify({"status": "error", "message": f"Patient with ID {patient_id} not found."}), 404

    success = delete_patient(patient_id)
    if success:
        return jsonify({
            "status": "success",
            "message": f"Patient #{patient_id} ({existing['full_name']}) was deleted successfully."
        }), 200
    return jsonify({"status": "error", "message": "Failed to delete record."}), 500


@app.route("/api/assessment-suite", methods=["GET"])
def get_assessment_suite():
    """
    Returns the 10 assessment entries with their live validation status,
    intentional failure analysis, and predicted health remarks.
    """
    results = run_assessment_validation()
    return jsonify({
        "status": "success",
        "total_entries": len(results),
        "data": results
    }), 200


@app.route("/api/assessment-suite/seed", methods=["POST"])
def seed_assessment_suite():
    """
    Seeds database with all valid records from the assessment test suite.
    Optionally clears existing records first (default: true).
    """
    payload = request.get_json() or {}
    clear_existing = payload.get("clear_existing", True)

    if clear_existing:
        reset_db()

    results = run_assessment_validation()
    seeded_records = []
    skipped_records = []

    for r in results:
        if r["is_valid"]:
            c = r["cleaned_data"]
            pred = r["prediction"]
            patient = create_patient(
                full_name=c["full_name"],
                dob=c["dob"],
                email=c["email"],
                glucose=c["glucose"],
                haemoglobin=c["haemoglobin"],
                cholesterol=c["cholesterol"],
                remarks=pred["remarks"],
                risk_level=pred["risk_level"],
                prediction_details=pred["details"]
            )
            seeded_records.append(patient)
        else:
            skipped_records.append({
                "entry_id": r["entry_id"],
                "name": r["raw_data"]["full_name"],
                "errors": r["errors"]
            })

    return jsonify({
        "status": "success",
        "message": f"Seeded {len(seeded_records)} valid records. Rejected {len(skipped_records)} invalid records.",
        "seeded_count": len(seeded_records),
        "rejected_count": len(skipped_records),
        "seeded": seeded_records,
        "rejected": skipped_records
    }), 200


@app.route("/api/reset", methods=["POST"])
def reset_database_endpoint():
    """Clears all patient records from the database."""
    reset_db()
    return jsonify({"status": "success", "message": "Database has been reset."}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[*] Starting Health Prediction API server on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
