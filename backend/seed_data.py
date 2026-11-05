"""
Health Prediction Application - Database Seeder Utility
Seeds the database with valid assessment patients and computes health predictions.
Can be executed from CLI: `python seed_data.py`
"""

import sys
from database import init_db, create_patient, reset_db, get_all_patients
from validator import validate_patient_record
from ai_service import generate_external_ai_prediction
from test_dataset import ASSESSMENT_ENTRIES


def seed_valid_records(clear_first=True):
    """Seed the database with all valid records from the assessment dataset."""
    init_db()

    if clear_first:
        reset_db()
        print("[INFO] Database cleared before seeding.")

    seeded_count = 0
    rejected_count = 0

    print("[INFO] Evaluating and seeding assessment entries...")
    for entry in ASSESSMENT_ENTRIES:
        is_valid, cleaned, errors = validate_patient_record(entry)

        if not is_valid:
            print(f"  [SKIPPED INVALID] Entry #{entry['id']} ({entry['full_name']}) - {list(errors.values())[0]}")
            rejected_count += 1
            continue

        # Generate health prediction & remarks
        remarks, risk_level, prediction_details = generate_external_ai_prediction(
            full_name=cleaned["full_name"],
            age=cleaned["age"],
            glucose=cleaned["glucose"],
            haemoglobin=cleaned["haemoglobin"],
            cholesterol=cleaned["cholesterol"]
        )

        patient = create_patient(
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
        print(f"  [SUCCESSFULLY SEEDED] #{patient['id']}: {patient['full_name']} | Risk: {patient['risk_level']}")
        seeded_count += 1

    total_in_db = len(get_all_patients())
    print(f"\n[DONE] Seeded {seeded_count} valid records. {rejected_count} invalid records correctly rejected.")
    print(f"[TOTAL IN DB]: {total_in_db} records.")
    return seeded_count


if __name__ == "__main__":
    clear = "--no-clear" not in sys.argv
    seed_valid_records(clear_first=clear)
