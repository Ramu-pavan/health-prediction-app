"""
Health Prediction Application - Data Validation Engine
Implements strict business and clinical validations:
- Valid email format (flags missing '@', missing top-level domain e.g. 'hunter@gmail')
- Date of birth parsing (supports dd/mm/yy, dd.mm.yyyy, dd/mm/yyyy, yyyy-mm-dd)
- Strict future date rejection (flags invalid future dates e.g. 19.10.2030)
- Calendar day/month validation (flags impossible dates e.g. 31/02/1990)
- Numeric blood test verification (Glucose, Haemoglobin, Cholesterol)
- Physiological range checks (flags negative values like -4.5 and non-numeric inputs)
"""

import re
from datetime import datetime, date


EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
)


def parse_and_validate_date(date_str):
    """
    Parses date strings across various standard formats:
    - dd.mm.yyyy (e.g., 19.10.2030, 12.05.1988)
    - dd/mm/yyyy (e.g., 14/05/1988)
    - dd/mm/yy   (e.g., 14/05/88)
    - dd.mm.yy   (e.g., 14.05.88)
    - yyyy-mm-dd (e.g., 1988-05-14)
    
    Returns:
        (parsed_date_obj, iso_str, formatted_str, None) on success
        (None, None, None, error_message) on failure
    """
    if not date_str or not str(date_str).strip():
        return None, None, None, "Date of birth is required and cannot be empty."

    raw = str(date_str).strip()
    parsed_date = None

    # Check for basic delimiters
    formats_to_try = [
        ("%d.%m.%Y", True),
        ("%d/%m/%Y", True),
        ("%Y-%m-%d", True),
        ("%d-%m-%Y", True),
        ("%d/%m/%y", False),  # 2-digit year
        ("%d.%m.%y", False),  # 2-digit year
        ("%d-%m-%y", False),  # 2-digit year
    ]

    for fmt, is_4digit in formats_to_try:
        try:
            dt = datetime.strptime(raw, fmt).date()
            # If 2-digit year parsed as 20xx but meant 19xx (e.g. 88 -> 2088 vs 1988)
            if not is_4digit:
                current_year = date.today().year
                if dt.year > current_year:
                    # Adjust century: 1988 instead of 2088
                    dt = dt.replace(year=dt.year - 100)
            parsed_date = dt
            break
        except ValueError:
            continue

    if not parsed_date:
        # Check if the structure looks like day/month/year but has invalid day (e.g. 31/02/1990)
        match = re.match(r"^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$", raw)
        if match:
            day, month, year = int(match.group(1)), int(match.group(2)), int(match.group(3))
            if month < 1 or month > 12:
                return None, None, None, f"Invalid Month: '{month}' is not a valid month (must be 1-12) in '{raw}'."
            if day < 1 or day > 31:
                return None, None, None, f"Invalid Day: '{day}' is not a valid calendar day in '{raw}'."
            return None, None, None, f"Invalid Calendar Date: '{raw}' does not exist on the calendar (e.g., February 31st or invalid leap year)."
        return None, None, None, f"Invalid Date format: '{raw}'. Accepted formats: DD/MM/YYYY, DD.MM.YYYY, DD/MM/YY, or YYYY-MM-DD."

    # Validate against future date
    today = date.today()
    if parsed_date > today:
        return None, None, None, (
            f"Future Date Detected: Date of birth '{raw}' ({parsed_date.strftime('%d/%m/%Y')}) "
            f"cannot be in the future. Today is {today.strftime('%d/%m/%Y')}."
        )

    # Sanity check: age cannot exceed 130 years
    age = today.year - parsed_date.year - ((today.month, today.day) < (parsed_date.month, parsed_date.day))
    if age > 130:
        return None, None, None, f"Unrealistic Age: Date of birth indicates {age} years old. Please enter a valid date."

    iso_str = parsed_date.isoformat()
    formatted_str = parsed_date.strftime("%d/%m/%Y")
    return parsed_date, iso_str, formatted_str, None


def validate_email_address(email_str):
    """
    Validates email format:
    - Checks for presence of '@'
    - Checks for username before '@'
    - Checks for domain after '@'
    - Checks for valid top-level domain (.com, .org, etc.)
    Specifically flags inputs like 'hunter@gmail' (missing .com).
    """
    if not email_str or not str(email_str).strip():
        return False, "Email address is required."

    email = str(email_str).strip()

    if "@" not in email:
        return False, f"Invalid Email: Missing '@' symbol in '{email}'."

    parts = email.split("@")
    if len(parts) != 2:
        return False, f"Invalid Email: Multiple '@' symbols in '{email}'."

    user_part, domain_part = parts[0].strip(), parts[1].strip()

    if not user_part:
        return False, f"Invalid Email: Username part before '@' cannot be empty in '{email}'."

    if not domain_part:
        return False, f"Invalid Email: Domain part after '@' cannot be empty in '{email}'."

    if "." not in domain_part:
        return False, (
            f"Invalid Email: Missing top-level domain in '{email}'. "
            f"Domain '{domain_part}' must include an extension like .com, .org, or .net (e.g., hunter@gmail.com)."
        )

    tld = domain_part.split(".")[-1]
    if len(tld) < 2 or not tld.isalpha():
        return False, f"Invalid Email: Top-level domain extension '.{tld}' is invalid in '{email}'."

    if not EMAIL_REGEX.match(email):
        return False, f"Invalid Email: '{email}' does not adhere to standard RFC email format."

    return True, None


def validate_numeric_lab_value(field_name, value, min_val=0.1, max_val=1000.0, unit=""):
    """
    Validates that a blood metric is strictly numeric and within a positive physiological range.
    Rejects strings like 'High', 'invalid_val', negative values like -4.5, etc.
    """
    if value is None or (isinstance(value, str) and value.strip() == ""):
        return None, f"{field_name} is required and cannot be empty."

    raw_str = str(value).strip()

    try:
        num = float(raw_str)
    except (ValueError, TypeError):
        return None, (
            f"Non-numeric Value: {field_name} must be a valid numeric number. "
            f"Received invalid input: '{raw_str}'."
        )

    # Check for NaN or Inf
    import math
    if math.isnan(num) or math.isinf(num):
        return None, f"Invalid Value: {field_name} cannot be NaN or Infinity."

    # Check for non-negative
    if num <= 0:
        return None, (
            f"Negative/Zero Value: {field_name} must be a positive number greater than 0. "
            f"Received: {num} {unit}."
        )

    # Extreme physiological bounds check (as a safety flag)
    if num > max_val:
        return None, (
            f"Physiologically Implausible: {field_name} value of {num} {unit} "
            f"exceeds standard biological limits (maximum plausible: {max_val} {unit})."
        )

    return num, None


def validate_patient_record(data):
    """
    Comprehensive record validator for a single patient record.
    Returns:
        (is_valid: bool, cleaned_data: dict, errors: dict)
    """
    errors = {}
    cleaned = {}

    # 1. Full Name
    raw_name = data.get("full_name") or data.get("name")
    if not raw_name or not str(raw_name).strip():
        errors["full_name"] = "Full Name is required and cannot be empty."
    elif len(str(raw_name).strip()) < 2:
        errors["full_name"] = "Full Name must be at least 2 characters long."
    else:
        cleaned["full_name"] = str(raw_name).strip()

    # 2. Date of Birth
    raw_dob = data.get("dob") or data.get("date_of_birth")
    parsed_dt, iso_dob, formatted_dob, dob_err = parse_and_validate_date(raw_dob)
    if dob_err:
        errors["dob"] = dob_err
    else:
        cleaned["dob"] = formatted_dob
        cleaned["dob_iso"] = iso_dob
        today = date.today()
        cleaned["age"] = today.year - parsed_dt.year - ((today.month, today.day) < (parsed_dt.month, parsed_dt.day))

    # 3. Email Address
    raw_email = data.get("email") or data.get("email_address")
    is_valid_email, email_err = validate_email_address(raw_email)
    if not is_valid_email:
        errors["email"] = email_err
    else:
        cleaned["email"] = str(raw_email).strip().lower()

    # 4. Glucose (Numeric, mg/dL)
    raw_glucose = data.get("glucose")
    num_glucose, glucose_err = validate_numeric_lab_value("Glucose", raw_glucose, min_val=10, max_val=800, unit="mg/dL")
    if glucose_err:
        errors["glucose"] = glucose_err
    else:
        cleaned["glucose"] = round(num_glucose, 1)

    # 5. Haemoglobin (Numeric, g/dL)
    raw_haemoglobin = data.get("haemoglobin") or data.get("hemoglobin")
    num_haemoglobin, haemoglobin_err = validate_numeric_lab_value("Haemoglobin", raw_haemoglobin, min_val=1, max_val=30, unit="g/dL")
    if haemoglobin_err:
        errors["haemoglobin"] = haemoglobin_err
    else:
        cleaned["haemoglobin"] = round(num_haemoglobin, 1)

    # 6. Cholesterol (Numeric, mg/dL)
    raw_cholesterol = data.get("cholesterol")
    num_cholesterol, cholesterol_err = validate_numeric_lab_value("Cholesterol", raw_cholesterol, min_val=20, max_val=700, unit="mg/dL")
    if cholesterol_err:
        errors["cholesterol"] = cholesterol_err
    else:
        cleaned["cholesterol"] = round(num_cholesterol, 1)

    is_valid = len(errors) == 0
    return is_valid, cleaned, errors
