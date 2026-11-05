# Health Prediction & Patient Intelligence Web Application

A full-stack, enterprise-grade healthcare assessment web application built with **Python (Flask & SQLite)** on the backend and **React, Vite, and Tailwind CSS** on the frontend.

The application captures patient demographic and clinical biometric indicators, executes strict multi-point data integrity validation, provides complete CRUD operations, and uses an AI Clinical Decision Support Engine to diagnose potential health conditions and disease risks.

---

## 1. System Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│               React + Vite + Tailwind CSS UI                │
│    (Port 3000 | Dynamic Forms, Real-Time Validation,        │
│     Assessment Audit Suite, Clinical Scorecard Modals)      │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API (HTTP)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Python (Flask) REST Server                  │
│                   (Port 5000 | Flask-CORS)                  │
├─────────────────────────────────────────────────────────────┤
│ • validator.py   : RFC 5322 Emails, Multi-format DOB parser,│
│                    Future Date Check, Positive Numeric Lab  │
│ • ai_service.py  : WHO/ADA/AHA Clinical Intelligence Model  │
│                    & External AI API Connector (Gemini/OAI) │
│ • database.py    : SQLite Persistent Storage Layer          │
│ • test_dataset.py: 10-Entry Assessment Validation Test Suite│
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               SQLite Database (Persistent DB)               │
│                   (health_prediction.db)                    │
└─────────────────────────────────────────────────────────────┘
```

- **Backend**: Python 3.7+ with **Flask 2.2**, **Flask-CORS**, and native **SQLite3** for persistent relational storage.
- **Frontend**: **React 18**, **Vite 5**, and **Tailwind CSS 3** with **Lucide React** medical iconography.
- **AI Health Engine**: Multi-marker metabolic scoring based on American Diabetes Association (ADA), World Health Organization (WHO), and American Heart Association (AHA) clinical standards, with optional external Gemini / OpenAI API integration.

---

## 2. Core Patient Data Schema & Validation Rules

| Field Name | Type | Validation & Formatting Rules |
| :--- | :--- | :--- |
| **Full Name** | String | Required. Minimum 2 characters. |
| **Date of Birth** | String / Date | Supports `DD/MM/YYYY`, `DD.MM.YYYY`, `DD/MM/YY`, `DD.MM.YY`, and `YYYY-MM-DD`. Validates calendar existence (e.g. leap years; rejects impossible dates like `31/02/1990`). **Strictly forbids future dates** (e.g. `19.10.2030` is rejected). |
| **Email Address** | String | RFC 5322 email regex. Validates user prefix, `@` separator, domain name, and **top-level domain extension**. Strictly rejects incomplete emails like `hunter@gmail`. |
| **Glucose** | Numeric | Fasting blood sugar in `mg/dL`. Must be a positive numeric value (`> 0`). Rejects strings like `'High'` or `'invalid_val'`. |
| **Haemoglobin** | Numeric | Blood haemoglobin in `g/dL`. Must be a positive numeric value (`> 0`). Rejects negative values like `-4.5`. |
| **Cholesterol** | Numeric | Total cholesterol in `mg/dL`. Must be a positive numeric value (`> 0`). |
| **Remarks** | String | **Automatically generated** by the AI Health Risk Engine upon valid data submission. Summarizes condition risks and recommended clinical action steps. |
| **Risk Level** | String | Evaluated as `Low`, `Moderate`, `High`, or `Critical`. |

---

## 3. The 10 Assessment Test Cases (Demonstration Matrix)

The application includes a built-in **Assessment Test Suite** covering the 10 specific records from the assessment document (ranging from **Robyn Pears** to **Prem Kumar**).

| # | Patient Name | DOB | Email | Glucose | Haemoglobin | Cholesterol | Expected Status | Intentional Error / Clinical Condition |
| :---: | :--- | :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **1** | **Robyn Pears** | 14/05/1988 | `robyn.pears@example.com` | 92 | 14.2 | 185 | **VALID (Pass)** | **Baseline Normal**. Optimal glycemic, hematologic, and lipid metrics. Predicted Risk: **Low**. |
| **2** | **John Hunter** | 24/08/1975 | `hunter@gmail` | 145 | 13.8 | 220 | **INVALID (Fail)** | **Invalid Email**: Missing top-level domain extension (`.com`). Domain `gmail` is incomplete. |
| **3** | **Peter Larry** | 05/11/1982 | `peter.larry@company.com` | `invalid_val` | 15.0 | 210 | **INVALID (Fail)** | **Non-Numeric Value**: Glucose contains non-numeric characters (`invalid_val`). |
| **4** | **Kris Wu** | 31/02/1990 | `kris.wu@outlook.com` | 105 | 14.0 | 190 | **INVALID (Fail)** | **Invalid Calendar Date**: February has at most 29 days. `31/02/1990` does not exist on the calendar. |
| **5** | **Sarah Connor** | 10.11.1984 | `sarah.connor@cyberdyne.org` | 180 | 11.2 | 255 | **VALID (Pass)** | **High/Critical Metabolic Risk**: Severe hyperglycemia (180 mg/dL), mild anemia (11.2 g/dL), and hypercholesterolemia (255 mg/dL). |
| **6** | **Michael Brown** | 15/07/1965 | `michael.brown@provider.net` | 110 | `-4.5` | 195 | **INVALID (Fail)** | **Biological Bound Failure**: Haemoglobin cannot be negative (`-4.5 g/dL`). Must be positive. |
| **7** | **Emily Davis** | 03.04.1995 | `emily.davis@healthnet.com` | 88 | 9.8 | 170 | **VALID (Pass)** | **Moderate Risk (Anemia)**: Haemoglobin 9.8 g/dL triggers moderate anemia clinical remarks. |
| **8** | **David Smith** | 19.10.2030 | `david.smith@futuremail.com` | 100 | 14.5 | 190 | **INVALID (Fail)** | **Future Date of Birth**: `19.10.2030` is after today's date. Patient cannot be born in the future. |
| **9** | **Maria Garcia** | 22/09/1979 | `maria.garcia@globalmed.org` | 130 | 13.1 | 260 | **VALID (Pass)** | **High Risk**: Borderline diabetes/hyperglycemia + high cholesterol (260 mg/dL). |
| **10** | **Prem Kumar** | 08.12.1972 | `prem.kumar@enterprise.in` | 210 | 14.8 | 240 | **VALID (Pass)** | **Critical Risk**: Severe Hyperglycemia (210 mg/dL - Type 2 Diabetes Mellitus) + Hypercholesterolemia. |

---

## 4. Complete Project Directory Structure

```
health-prediction-app/
├── backend/
│   ├── app.py                     # Main Flask REST API & HTTP routes
│   ├── database.py                # SQLite persistent database manager & schema
│   ├── validator.py               # Robust validation engine (email, DOB, bounds)
│   ├── ai_service.py              # Clinical Risk Engine (ADA/WHO/AHA) + External AI
│   ├── test_dataset.py            # The 10 assessment entries + automated test runner
│   ├── seed_data.py               # CLI database seeder script
│   ├── test_api.py                # 11-step integration test suite
│   ├── requirements.txt           # Python dependencies (flask, flask-cors)
│   └── health_prediction.db       # Persistent SQLite database file
├── frontend/
│   ├── index.html                 # HTML template with Google Fonts
│   ├── package.json               # Frontend dependencies (React, Vite, Tailwind, Lucide)
│   ├── vite.config.js             # Vite configuration with proxy to backend:5000
│   ├── tailwind.config.js         # Tailwind CSS styling configuration
│   ├── postcss.config.js          # PostCSS configuration
│   └── src/
│       ├── main.jsx               # React entry point
│       ├── App.jsx                # Core application dashboard state & layout
│       ├── index.css              # Global styles & custom scrollbars
│       ├── data/
│       │   └── assessmentData.js  # Preloaded assessment test cases
│       ├── services/
│       │   └── api.js             # Resilient HTTP client with structured error parser
│       └── components/
│           ├── Navbar.jsx               # Header with live server status & action buttons
│           ├── StatsOverview.jsx        # 4 Metric summary cards with clinical benchmarks
│           ├── PatientTable.jsx         # CRUD data table with search, filter, and badges
│           ├── PatientModal.jsx         # Create/Edit modal with real-time validation feedback
│           ├── AssessmentSuiteModal.jsx # 10-Entry Interactive Assessment Audit runner
│           ├── HealthReportModal.jsx    # Clinical scorecard with biomarker analysis
│           └── DeleteConfirmModal.jsx   # Safe record deletion confirmation dialog
├── start_app.bat                  # 1-Click launcher for both backend & frontend
├── run_backend.bat                # Direct launcher for Python backend
├── run_frontend.bat               # Direct launcher for Vite frontend
└── README.md                      # Comprehensive documentation & video script
```

---

## 5. How to Run the Application Locally

### Prerequisites
- **Python**: 3.7 or higher
- **Node.js**: v18 or higher (includes npm)

### Option A: 1-Click Launch (Recommended for Windows)
Simply double-click the **`start_app.bat`** file in the root directory.
This script launches:
1. The Python Flask Backend in window 1 (`http://127.0.0.1:5000`)
2. The React Vite Frontend in window 2 (`http://localhost:3000`)

---

### Option B: Manual Terminal Execution

#### 1. Start the Python Backend
Open a terminal in the `backend/` directory:
```bash
cd backend
python -m pip install -r requirements.txt
python app.py
```
*The server will start on `http://127.0.0.1:5000` with persistent storage in `health_prediction.db`.*

#### 2. Start the React Frontend
Open a second terminal in the `frontend/` directory:
```bash
cd frontend
npm run dev
```
*The UI will start on `http://localhost:3000`.*

---

## 6. How to Run the Assessment Validation Test Suite in CLI

You can run the automated validation test suite on the terminal to verify the 10 assessment entries at any time:

```bash
cd backend
python test_dataset.py
```

**Expected Terminal Output:**
```
================================================================================
 HEALTH PREDICTION APPLICATION - ASSESSMENT TEST DATASET VALIDATION REPORT 
================================================================================

Entry #1: Robyn Pears
  DOB: 14/05/1988 | Email: robyn.pears@example.com
  Glucose: 92 | Haemoglobin: 14.2 | Cholesterol: 185
  Result: [VALID RECORD] [TEST PASSED]
  Predicted Risk: Low
  AI Remarks: Optimal health profile. All metabolic, hematologic, and lipid markers within standard reference ranges.

Entry #2: John Hunter
  DOB: 24/08/1975 | Email: hunter@gmail
  Glucose: 145 | Haemoglobin: 13.8 | Cholesterol: 220
  Result: [INVALID RECORD - REJECTED] [TEST PASSED]
  Validation Errors Caught:
    - [EMAIL]: Invalid Email: Missing top-level domain in 'hunter@gmail'. Domain 'gmail' must include an extension like .com, .org, or .net.

Entry #3: Peter Larry
  DOB: 05/11/1982 | Email: peter.larry@company.com
  Glucose: invalid_val | Haemoglobin: 15.0 | Cholesterol: 210
  Result: [INVALID RECORD - REJECTED] [TEST PASSED]
  Validation Errors Caught:
    - [GLUCOSE]: Non-numeric Value: Glucose must be a valid numeric number. Received invalid input: 'invalid_val'.

Entry #4: Kris Wu
  DOB: 31/02/1990 | Email: kris.wu@outlook.com
  Glucose: 105 | Haemoglobin: 14.0 | Cholesterol: 190
  Result: [INVALID RECORD - REJECTED] [TEST PASSED]
  Validation Errors Caught:
    - [DOB]: Invalid Calendar Date: '31/02/1990' does not exist on the calendar (e.g., February 31st or invalid leap year).

Entry #8: David Smith
  DOB: 19.10.2030 | Email: david.smith@futuremail.com
  Glucose: 100 | Haemoglobin: 14.5 | Cholesterol: 190
  Result: [INVALID RECORD - REJECTED] [TEST PASSED]
  Validation Errors Caught:
    - [DOB]: Future Date Detected: Date of birth '19.10.2030' (19/10/2030) cannot be in the future.

================================================================================
SUMMARY: 10 Entries Evaluated | 5 Valid Passed | 5 Intentional Errors Caught
Test Suite Execution: 10/10 Intentional Test Assertions Succeeded (100% Accuracy)
================================================================================
```

---

## 7. Step-by-Step Video Demonstration Script

When recording your video assessment, follow these recommended steps to showcase all required criteria:

### Step 1: Introduction (30 seconds)
- Open the application at `http://localhost:3000`.
- Point out the **Live Server Status pill** (showing "Online" connected to Flask).
- Highlight the 4 **Metric Overview Cards** displaying registered patients, risk distribution, and average blood markers against clinical targets.

### Step 2: Showcase the Assessment Test Suite (1.5 minutes)
- Click the top purple button: **"Assessment Test Suite (10)"**.
- Show the 10 entries ranging from **Robyn Pears (#1)** to **Prem Kumar (#10)**.
- Filter by **"5 Intentional Errors"** to explain the exact intentional failures:
  1. **John Hunter**: Show `hunter@gmail` and explain that standard emails require a top-level domain (`.com`).
  2. **Peter Larry**: Show `invalid_val` in Glucose and explain the numeric laboratory constraint.
  3. **Kris Wu**: Show `31/02/1990` and explain calendar date validation (February does not have 31 days).
  4. **Michael Brown**: Show `-4.5` Haemoglobin and explain biological bound validation.
  5. **David Smith (#8)**: Show `19.10.2030` and explain that date of birth cannot be a future date.
- Click **"Test Server Rejection"** on John Hunter or David Smith to demonstrate real-time HTTP 422 rejection.
- Click **"Seed 5 Valid to DB"** to populate the database with the 5 valid patients (Robyn Pears, Sarah Connor, Emily Davis, Maria Garcia, Prem Kumar).

### Step 3: Demonstrate CRUD Operations (1.5 minutes)
- **Create**:
  - Click **"+ Add Patient"**.
  - Use the "Demo Quick-Fill" dropdown or type manual data.
  - Show how entering an invalid date like `19.10.2030` or `hunter@gmail` turns the input border red and displays the warning message in real-time.
  - Correct the inputs, click **"Test AI Prediction"** to preview remarks, and submit.
- **Read**:
  - Use the search bar to search for "Prem Kumar".
  - Filter the table by risk level: "Critical", "Moderate", or "Low".
  - Click the **"View Health Details"** eye icon on Prem Kumar or Sarah Connor to open the **Health Report Modal**, showing the biomarker breakdown, clinical condition risks, and AI remarks.
- **Update**:
  - Click the pencil icon (Edit) on a patient.
  - Modify their glucose (e.g. from 92 to 195).
  - Submit and show that the AI automatically re-evaluates their disease risk and regenerates the remarks column!
- **Delete**:
  - Click the trash icon on a patient.
  - Show the confirmation modal, confirm deletion, and watch the patient count and averages update immediately.

---

## 8. REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health status and engine metadata |
| `GET` | `/api/stats` | Aggregated dashboard counts and biomarker averages |
| `GET` | `/api/patients` | Retrieve patient records (supports `?search=` and `?risk_level=`) |
| `GET` | `/api/patients/<id>` | Fetch single patient with full risk breakdown |
| `POST` | `/api/patients` | Validate and create patient; generates AI remarks |
| `PUT` | `/api/patients/<id>` | Validate and update patient; recalculates AI remarks |
| `DELETE` | `/api/patients/<id>` | Permanently remove a patient record |
| `POST` | `/api/patients/validate` | Dry-run validation check without database insertion |
| `GET` | `/api/assessment-suite` | Audit report for the 10 assessment entries |
| `POST` | `/api/assessment-suite/seed` | Seed database with valid records from the test suite |
| `POST` | `/api/reset` | Clear all records from the database |
