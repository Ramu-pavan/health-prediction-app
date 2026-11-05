/**
 * The 10 Assessment Test Cases (Robyn Pears to Prem Kumar)
 * Preloaded for immediate demonstration and validation audit.
 */

export const ASSESSMENT_PRELOADED_ENTRIES = [
  {
    id: 1,
    full_name: "Robyn Pears",
    dob: "14/05/1988",
    email: "robyn.pears@example.com",
    glucose: 92,
    haemoglobin: 14.2,
    cholesterol: 185,
    expected_valid: true,
    test_intent: "Valid baseline test entry. All biomarkers within optimal clinical ranges."
  },
  {
    id: 2,
    full_name: "John Hunter",
    dob: "24/08/1975",
    email: "hunter@gmail",
    glucose: 145,
    haemoglobin: 13.8,
    cholesterol: 220,
    expected_valid: false,
    test_intent: "Intentional email format failure: missing top-level domain extension like '.com' in 'hunter@gmail'."
  },
  {
    id: 3,
    full_name: "Peter Larry",
    dob: "05/11/1982",
    email: "peter.larry@company.com",
    glucose: "invalid_val",
    haemoglobin: 15.0,
    cholesterol: 210,
    expected_valid: false,
    test_intent: "Intentional blood test failure: Glucose value is a non-numeric string ('invalid_val')."
  },
  {
    id: 4,
    full_name: "Kris Wu",
    dob: "31/02/1990",
    email: "kris.wu@outlook.com",
    glucose: 105,
    haemoglobin: 14.0,
    cholesterol: 190,
    expected_valid: false,
    test_intent: "Intentional calendar date failure: February has at most 29 days ('31/02/1990')."
  },
  {
    id: 5,
    full_name: "Sarah Connor",
    dob: "10.11.1984",
    email: "sarah.connor@cyberdyne.org",
    glucose: 180,
    haemoglobin: 11.2,
    cholesterol: 255,
    expected_valid: true,
    test_intent: "Valid entry with high cardiovascular & diabetic risk for AI prediction validation."
  },
  {
    id: 6,
    full_name: "Michael Brown",
    dob: "15/07/1965",
    email: "michael.brown@provider.net",
    glucose: 110,
    haemoglobin: -4.5,
    cholesterol: 195,
    expected_valid: false,
    test_intent: "Intentional biological bounds failure: Haemoglobin cannot be negative (-4.5)."
  },
  {
    id: 7,
    full_name: "Emily Davis",
    dob: "03.04.1995",
    email: "emily.davis@healthnet.com",
    glucose: 88,
    haemoglobin: 9.8,
    cholesterol: 170,
    expected_valid: true,
    test_intent: "Valid entry demonstrating moderate risk prediction for anemia (low haemoglobin)."
  },
  {
    id: 8,
    full_name: "David Smith",
    dob: "19.10.2030",
    email: "david.smith@futuremail.com",
    glucose: 100,
    haemoglobin: 14.5,
    cholesterol: 190,
    expected_valid: false,
    test_intent: "Intentional future date failure: Date of birth '19.10.2030' cannot be in the future."
  },
  {
    id: 9,
    full_name: "Maria Garcia",
    dob: "22/09/1979",
    email: "maria.garcia@globalmed.org",
    glucose: 130,
    haemoglobin: 13.1,
    cholesterol: 260,
    expected_valid: true,
    test_intent: "Valid entry demonstrating moderate-to-high risk for hypercholesterolemia & impaired glucose."
  },
  {
    id: 10,
    full_name: "Prem Kumar",
    dob: "08.12.1972",
    email: "prem.kumar@enterprise.in",
    glucose: 210,
    haemoglobin: 14.8,
    cholesterol: 240,
    expected_valid: true,
    test_intent: "Valid entry demonstrating critical/high risk prediction for severe diabetes."
  }
];
