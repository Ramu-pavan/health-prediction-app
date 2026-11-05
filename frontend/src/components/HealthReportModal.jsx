import React from 'react';
import {
  X,
  Activity,
  HeartPulse,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  Sparkles,
  Calendar,
  Mail,
  User
} from 'lucide-react';

export default function HealthReportModal({
  isOpen,
  onClose,
  patient,
}) {
  if (!isOpen || !patient) return null;

  const details = patient.prediction_details || {};
  const biomarkers = details.biomarkers || {};
  const conditions = details.conditions || [];
  const recommendations = details.recommendations || [];

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'critical':
        return {
          bg: 'bg-purple-500',
          badge: 'bg-purple-100 text-purple-900 border-purple-300',
          text: 'text-purple-700',
        };
      case 'high':
        return {
          bg: 'bg-rose-500',
          badge: 'bg-rose-100 text-rose-900 border-rose-300',
          text: 'text-rose-700',
        };
      case 'moderate':
        return {
          bg: 'bg-amber-500',
          badge: 'bg-amber-100 text-amber-900 border-amber-300',
          text: 'text-amber-700',
        };
      case 'low':
      default:
        return {
          bg: 'bg-emerald-500',
          badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          text: 'text-emerald-700',
        };
    }
  };

  const riskStyle = getRiskColor(patient.risk_level);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Risk Bar */}
        <div className={`h-2.5 w-full ${riskStyle.bg}`} />
        <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-md">
              {patient.full_name
                ?.split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900">
                  {patient.full_name}
                </h2>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${riskStyle.badge}`}>
                  {patient.risk_level} Risk
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  DOB: {patient.dob}
                </span>
                <span className="flex items-center">
                  <Mail className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  {patient.email}
                </span>
                <span className="font-mono text-slate-400">ID: #{patient.id}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* AI Clinical Diagnosis & Remarks Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                Diagnostic Assessment & AI Remarks
              </span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              "{patient.remarks}"
            </p>
            <div className="mt-2 text-[10px] text-blue-700/80 font-mono">
              Engine: {details.model_engine || 'Clinical Decision Intelligence Engine v2.4 (ADA/WHO Guidelines)'}
            </div>
          </div>

          {/* Biomarkers Scorecard */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Laboratory Blood Metrics Analysis
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Glucose Card */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold flex items-center">
                    <Droplets className="h-3.5 w-3.5 mr-1 text-blue-500" /> Glucose
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">mg/dL</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {patient.glucose}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-700">
                  {biomarkers?.glucose?.classification || (patient.glucose > 125 ? 'Hyperglycemia' : patient.glucose > 99 ? 'Prediabetes' : 'Normal')}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Target: 70 - 99 mg/dL
                </div>
              </div>

              {/* Haemoglobin Card */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold flex items-center">
                    <Activity className="h-3.5 w-3.5 mr-1 text-rose-500" /> Haemoglobin
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">g/dL</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {patient.haemoglobin}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-700">
                  {biomarkers?.haemoglobin?.classification || (patient.haemoglobin < 12.0 ? 'Anemia' : 'Normal Oxygenation')}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Target: 12.0 - 17.5 g/dL
                </div>
              </div>

              {/* Cholesterol Card */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold flex items-center">
                    <HeartPulse className="h-3.5 w-3.5 mr-1 text-amber-500" /> Cholesterol
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">mg/dL</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {patient.cholesterol}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-700">
                  {biomarkers?.cholesterol?.classification || (patient.cholesterol >= 240 ? 'High Cholesterol' : patient.cholesterol >= 200 ? 'Borderline High' : 'Desirable')}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Target: &lt; 200 mg/dL
                </div>
              </div>
            </div>
          </div>

          {/* Conditions Detected & Recommendations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Identified Conditions */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center">
                <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                Detected Health Conditions
              </h5>
              {conditions.length > 0 ? (
                <ul className="space-y-1.5">
                  {conditions.map((c, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 mr-2 shrink-0" />
                      <span className="font-medium">{c}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">No pathological conditions detected.</p>
              )}
            </div>

            {/* Recommendations */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                Clinical Action Items
              </h5>
              {recommendations.length > 0 ? (
                <ul className="space-y-1.5">
                  {recommendations.map((r, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 mr-2 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">Maintain standard preventive checkups.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Created: {patient.created_at ? new Date(patient.created_at).toLocaleString() : 'N/A'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-sm"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
