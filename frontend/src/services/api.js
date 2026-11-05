/**
 * Health Prediction Application - Frontend API Client
 * Centralizes all REST calls to the Python backend with resilient error parsing.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

/**
 * Generic fetch wrapper with JSON serialization and robust error extraction.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const error = new Error(
        data?.message || (typeof data === 'string' ? data : `HTTP ${response.status}`)
      );
      error.status = response.status;
      error.errors = data?.errors || {};
      error.payload = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) throw err;
    const networkError = new Error('Could not connect to backend server. Please ensure the Python server is running on http://127.0.0.1:5000.');
    networkError.isNetworkError = true;
    throw networkError;
  }
}

export const api = {
  // System Health
  getHealth: () => request('/health'),
  getStats: () => request('/stats'),

  // Patients CRUD
  getPatients: (search = '', riskLevel = 'all') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (riskLevel && riskLevel !== 'all') params.append('risk_level', riskLevel);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/patients${query}`);
  },

  getPatientById: (id) => request(`/patients/${id}`),

  createPatient: (patientData) =>
    request('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    }),

  updatePatient: (id, patientData) =>
    request(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    }),

  deletePatient: (id) =>
    request(`/patients/${id}`, {
      method: 'DELETE',
    }),

  // Dry-run real-time validation
  validatePatient: (patientData) =>
    request('/patients/validate', {
      method: 'POST',
      body: JSON.stringify(patientData),
    }),

  // Assessment Test Suite
  getAssessmentSuite: () => request('/assessment-suite'),

  seedAssessmentSuite: (clearExisting = true) =>
    request('/assessment-suite/seed', {
      method: 'POST',
      body: JSON.stringify({ clear_existing: clearExisting }),
    }),

  resetDatabase: () =>
    request('/reset', {
      method: 'POST',
    }),
};
