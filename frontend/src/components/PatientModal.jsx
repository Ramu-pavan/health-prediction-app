import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import { ASSESSMENT_PRELOADED_ENTRIES } from '../data/assessmentData';

export default function PatientModal({
  isOpen,
  onClose,
  onSuccess,
  editPatient = null,
}) {
  const isEdit = Boolean(editPatient);

  const [formData, setFormData] = useState({
    full_name: '',
    dob: '',
    email: '',
    glucose: '',
    haemoglobin: '',
    cholesterol: '',
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewPrediction, setPreviewPrediction] = useState(null);

  // Initialize or reset form on open/edit
  useEffect(() => {
    if (editPatient) {
      setFormData({
        full_name: editPatient.full_name || '',
        dob: editPatient.dob || '',
        email: editPatient.email || '',
        glucose: editPatient.glucose ?? '',
        haemoglobin: editPatient.haemoglobin ?? '',
        cholesterol: editPatient.cholesterol ?? '',
      });
      setPreviewPrediction({
        remarks: editPatient.remarks,
        risk_level: editPatient.risk_level,
      });
    } else {
      setFormData({
        full_name: '',
        dob: '',
        email: '',
        glucose: '',
        haemoglobin: '',
        cholesterol: '',
      });
      setPreviewPrediction(null);
    }
    setErrors({});
    setGeneralError('');
  }, [editPatient, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user edits
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSelectPreloaded = (e) => {
    const selectedId = parseInt(e.target.value);
    if (!selectedId) return;
    const testEntry = ASSESSMENT_PRELOADED_ENTRIES.find((entry) => entry.id === selectedId);
    if (testEntry) {
      setFormData({
        full_name: testEntry.full_name,
        dob: testEntry.dob,
        email: testEntry.email,
        glucose: testEntry.glucose,
        haemoglobin: testEntry.haemoglobin,
        cholesterol: testEntry.cholesterol,
      });
      setErrors({});
      setGeneralError('');
      setPreviewPrediction(null);
    }
  };

  const handleDryRunPreview = async () => {
    setPreviewing(true);
    setErrors({});
    setGeneralError('');
    try {
      const res = await api.validatePatient(formData);
      if (!res.is_valid) {
        setErrors(res.errors || {});
        setGeneralError('Validation errors detected. Fix the highlighted fields below.');
        setPreviewPrediction(null);
      } else {
        setPreviewPrediction(res.preview_prediction);
      }
    } catch (err) {
      setGeneralError(err.message || 'Validation request failed.');
    } finally {
      setPreviewing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setGeneralError('');

    try {
      if (isEdit) {
        await api.updatePatient(editPatient.id, formData);
      } else {
        await api.createPatient(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      if (err.errors && Object.keys(err.errors).length > 0) {
        setErrors(err.errors);
        setGeneralError('Validation failed. Please correct the invalid fields highlighted below.');
      } else {
        setGeneralError(err.message || 'An unexpected error occurred while saving.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEdit ? 'Edit Patient Record' : 'Register New Patient'}
            </h2>
            <p className="text-xs text-slate-500">
              Enter demographic and clinical biomarkers for automated AI risk evaluation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Demo Auto-Fill Shortcut */}
        {!isEdit && (
          <div className="bg-blue-50/60 px-6 py-2.5 border-b border-blue-100 flex items-center justify-between text-xs">
            <span className="text-blue-900 font-semibold flex items-center">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
              Demo Assessment Quick-Fill:
            </span>
            <select
              onChange={handleSelectPreloaded}
              defaultValue=""
              className="text-xs py-1 px-2.5 rounded-md border border-blue-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="" disabled>Select test case to test validation...</option>
              {ASSESSMENT_PRELOADED_ENTRIES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  #{entry.id}: {entry.full_name} ({entry.expected_valid ? 'Valid' : 'Intentional Error'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Error Alert Banner */}
        {generalError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-800 text-xs">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">{generalError}</div>
              <div className="text-[11px] text-rose-600 mt-0.5">
                Review the red warning messages beneath each invalid field.
              </div>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g. Robyn Pears"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.full_name
                  ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 text-slate-800'
              }`}
            />
            {errors.full_name && (
              <p className="mt-1 text-xs text-rose-600 font-medium flex items-center">
                <AlertCircle className="h-3.5 w-3.5 mr-1 inline shrink-0" />
                {errors.full_name}
              </p>
            )}
          </div>

          {/* Grid: Date of Birth and Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date of Birth */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  dd/mm/yy or dd.mm.yyyy
                </span>
              </div>
              <input
                type="text"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                placeholder="e.g. 14/05/1988 or 14.05.88"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.dob
                    ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 text-slate-800'
                }`}
              />
              {errors.dob ? (
                <p className="mt-1 text-xs text-rose-600 font-medium flex items-start">
                  <AlertCircle className="h-3.5 w-3.5 mr-1 inline shrink-0 mt-0.5" />
                  <span>{errors.dob}</span>
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-slate-400">
                  Strictly validated: Cannot be a future date (e.g. 19.10.2030 will fail).
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  Must include domain (.com)
                </span>
              </div>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. robyn.pears@example.com"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 text-slate-800'
                }`}
              />
              {errors.email ? (
                <p className="mt-1 text-xs text-rose-600 font-medium flex items-start">
                  <AlertCircle className="h-3.5 w-3.5 mr-1 inline shrink-0 mt-0.5" />
                  <span>{errors.email}</span>
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-slate-400">
                  Flagged if missing '@' or domain (e.g. hunter@gmail fails).
                </p>
              )}
            </div>
          </div>

          {/* Blood Lab Values Section Header */}
          <div className="pt-2 pb-1 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Biometric & Laboratory Blood Metrics (Numeric Only)
            </h4>
          </div>

          {/* 3 Lab Values: Glucose, Haemoglobin, Cholesterol */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Glucose */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Glucose (mg/dL) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="glucose"
                value={formData.glucose}
                onChange={handleChange}
                placeholder="e.g. 95"
                className={`w-full px-3 py-2 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.glucose
                    ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 text-slate-800'
                }`}
              />
              {errors.glucose ? (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  {errors.glucose}
                </p>
              ) : (
                <span className="text-[10px] text-slate-400">Normal: 70 - 99</span>
              )}
            </div>

            {/* Haemoglobin */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Haemoglobin (g/dL) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="haemoglobin"
                value={formData.haemoglobin}
                onChange={handleChange}
                placeholder="e.g. 14.2"
                className={`w-full px-3 py-2 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.haemoglobin
                    ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 text-slate-800'
                }`}
              />
              {errors.haemoglobin ? (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  {errors.haemoglobin}
                </p>
              ) : (
                <span className="text-[10px] text-slate-400">Normal: 12.0 - 17.5</span>
              )}
            </div>

            {/* Cholesterol */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cholesterol (mg/dL) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="cholesterol"
                value={formData.cholesterol}
                onChange={handleChange}
                placeholder="e.g. 185"
                className={`w-full px-3 py-2 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.cholesterol
                    ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 text-slate-800'
                }`}
              />
              {errors.cholesterol ? (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  {errors.cholesterol}
                </p>
              ) : (
                <span className="text-[10px] text-slate-400">Desirable: &lt; 200</span>
              )}
            </div>
          </div>

          {/* AI Prediction Live Preview Box */}
          {previewPrediction && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-blue-900 flex items-center">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600 mr-1.5" />
                  Live AI Health Prediction & Remarks Preview:
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-800">
                  {previewPrediction.risk_level} Risk
                </span>
              </div>
              <p className="text-xs text-blue-900/90 leading-relaxed font-medium">
                "{previewPrediction.remarks}"
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDryRunPreview}
              disabled={previewing || submitting}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>{previewing ? 'Evaluating...' : 'Test AI Prediction'}</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center space-x-1.5"
              >
                {submitting ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Patient...</span>
                  </>
                ) : (
                  <span>{isEdit ? 'Update Patient' : 'Register & Predict'}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
