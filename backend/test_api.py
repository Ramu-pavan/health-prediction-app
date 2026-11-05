"""
Comprehensive API and Backend Integration Test Suite
Verifies:
1. Health check endpoint
2. List patients
3. Validation rejection for John Hunter (invalid email)
4. Validation rejection for Peter Larry (non-numeric glucose)
5. Validation rejection for Kris Wu (impossible calendar date)
6. Validation rejection for David Smith (future date 19.10.2030)
7. Successful creation of Robyn Pears with AI Remarks generation
8. Patient update (PUT)
9. Patient deletion (DELETE)
10. Assessment suite endpoints and database stats
"""

import json
from app import app
from database import init_db, reset_db


def run_tests():
    init_db()
    reset_db()
    client = app.test_client()

    print("[1] Testing GET /api/health...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print("    PASSED:", res.get_json())

    print("\n[2] Testing GET /api/assessment-suite (10 Entries)...")
    res = client.get("/api/assessment-suite")
    assert res.status_code == 200
    data = res.get_json()
    assert data["total_entries"] == 10
    print(f"    PASSED: Retrieved {data['total_entries']} assessment entries.")

    print("\n[3] Testing POST /api/patients with John Hunter (hunter@gmail)...")
    res = client.post("/api/patients", json={
        "full_name": "John Hunter",
        "dob": "24/08/1975",
        "email": "hunter@gmail",
        "glucose": 145,
        "haemoglobin": 13.8,
        "cholesterol": 220
    })
    assert res.status_code == 422, f"Expected 422, got {res.status_code}"
    err_json = res.get_json()
    assert "email" in err_json["errors"]
    print("    PASSED: Successfully rejected invalid email:", err_json["errors"]["email"])

    print("\n[4] Testing POST /api/patients with Peter Larry (glucose='invalid_val')...")
    res = client.post("/api/patients", json={
        "full_name": "Peter Larry",
        "dob": "05/11/1982",
        "email": "peter.larry@company.com",
        "glucose": "invalid_val",
        "haemoglobin": 15.0,
        "cholesterol": 210
    })
    assert res.status_code == 422
    err_json = res.get_json()
    assert "glucose" in err_json["errors"]
    print("    PASSED: Successfully rejected non-numeric glucose:", err_json["errors"]["glucose"])

    print("\n[5] Testing POST /api/patients with Kris Wu (dob='31/02/1990')...")
    res = client.post("/api/patients", json={
        "full_name": "Kris Wu",
        "dob": "31/02/1990",
        "email": "kris.wu@outlook.com",
        "glucose": 105,
        "haemoglobin": 14.0,
        "cholesterol": 190
    })
    assert res.status_code == 422
    err_json = res.get_json()
    assert "dob" in err_json["errors"]
    print("    PASSED: Successfully rejected invalid calendar date:", err_json["errors"]["dob"])

    print("\n[6] Testing POST /api/patients with David Smith (dob='19.10.2030' future date)...")
    res = client.post("/api/patients", json={
        "full_name": "David Smith",
        "dob": "19.10.2030",
        "email": "david.smith@futuremail.com",
        "glucose": 100,
        "haemoglobin": 14.5,
        "cholesterol": 190
    })
    assert res.status_code == 422
    err_json = res.get_json()
    assert "dob" in err_json["errors"]
    print("    PASSED: Successfully rejected future date:", err_json["errors"]["dob"])

    print("\n[7] Testing POST /api/patients with Robyn Pears (Valid data)...")
    res = client.post("/api/patients", json={
        "full_name": "Robyn Pears",
        "dob": "14/05/1988",
        "email": "robyn.pears@example.com",
        "glucose": 92,
        "haemoglobin": 14.2,
        "cholesterol": 185
    })
    assert res.status_code == 201, f"Expected 201, got {res.status_code}"
    robyn = res.get_json()["data"]
    assert robyn["risk_level"] == "Low"
    assert "Optimal health" in robyn["remarks"]
    print(f"    PASSED: Created patient #{robyn['id']} '{robyn['full_name']}' | Remarks: {robyn['remarks'][:60]}...")

    print("\n[8] Testing PUT /api/patients/<id> to update patient...")
    res = client.put(f"/api/patients/{robyn['id']}", json={
        "full_name": "Robyn Pears",
        "dob": "14/05/1988",
        "email": "robyn.pears@example.com",
        "glucose": 185,  # Changed to diabetic range
        "haemoglobin": 14.2,
        "cholesterol": 185
    })
    assert res.status_code == 200
    updated = res.get_json()["data"]
    assert updated["risk_level"] in ["High", "Critical"]
    print(f"    PASSED: Updated patient #{updated['id']}. Risk updated to {updated['risk_level']}.")

    print("\n[9] Testing GET /api/stats...")
    res = client.get("/api/stats")
    assert res.status_code == 200
    stats = res.get_json()["data"]
    print("    PASSED: Stats:", stats)

    print("\n[10] Testing DELETE /api/patients/<id>...")
    res = client.delete(f"/api/patients/{robyn['id']}")
    assert res.status_code == 200
    # Confirm deletion
    res = client.get(f"/api/patients/{robyn['id']}")
    assert res.status_code == 404
    print("    PASSED: Record deleted successfully.")

    print("\n[11] Testing POST /api/assessment-suite/seed...")
    res = client.post("/api/assessment-suite/seed", json={"clear_existing": True})
    assert res.status_code == 200
    seed_result = res.get_json()
    assert seed_result["seeded_count"] == 5
    assert seed_result["rejected_count"] == 5
    print(f"    PASSED: Seeded {seed_result['seeded_count']} valid, caught {seed_result['rejected_count']} invalid records.")

    print("\n" + "=" * 70)
    print(" ALL 11 API INTEGRATION TESTS PASSED WITH 100% SUCCESS! ")
    print("=" * 70)


if __name__ == "__main__":
    run_tests()
