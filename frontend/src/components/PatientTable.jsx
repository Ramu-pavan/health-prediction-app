import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  FileText,
  Sparkles,
  ChevronRight,
  UserPlus
} from 'lucide-react';

export default function PatientTable({
  patients,
  loading,
  searchTerm,
  setSearchTerm,
  riskFilter,
  setRiskFilter,
  onViewReport,
  onEditPatient,
  onDeletePatient,
  onOpenAddModal,
  onOpenAssessmentModal,
}) {
  const getRiskBadge = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'critical':
        return 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20';
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20';
      case 'moderate':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20';
      case 'low':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20';
    }
  };

  const getGlucoseBadge = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return { text: `${val}`, color: 'bg-slate-100 text-slate-700' };
    if (num < 70) return { text: `${num} (Low)`, color: 'bg-rose-50 text-rose-700' };
    if (num <= 99) return { text: `${num} (Normal)`, color: 'bg-emerald-50 text-emerald-700' };
    if (num <= 125) return { text: `${num} (Prediabetes)`, color: 'bg-amber-50 text-amber-700' };
    return { text: `${num} (High)`, color: 'bg-rose-50 text-rose-700 font-semibold' };
  };

  const getHaemoBadge = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return { text: `${val}`, color: 'bg-slate-100 text-slate-700' };
    if (num < 11.0) return { text: `${num} (Anemia)`, color: 'bg-rose-50 text-rose-700 font-semibold' };
    if (num < 12.0) return { text: `${num} (Borderline)`, color: 'bg-amber-50 text-amber-700' };
    if (num <= 17.5) return { text: `${num} (Normal)`, color: 'bg-emerald-50 text-emerald-700' };
    return { text: `${num} (High)`, color: 'bg-purple-50 text-purple-700' };
  };

  const getCholBadge = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return { text: `${val}`, color: 'bg-slate-100 text-slate-700' };
    if (num < 200) return { text: `${num} (Desirable)`, color: 'bg-emerald-50 text-emerald-700' };
    if (num <= 239) return { text: `${num} (Borderline)`, color: 'bg-amber-50 text-amber-700' };
    return { text: `${num} (High)`, color: 'bg-rose-50 text-rose-700 font-semibold' };
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Search & Filter Header Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by patient name or email..."
            className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Risk Level Filter Badges */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center">
            <Filter className="h-3.5 w-3.5 mr-1" /> Risk:
          </span>
          {['all', 'Low', 'Moderate', 'High', 'Critical'].map((level) => {
            const active = riskFilter.toLowerCase() === level.toLowerCase();
            return (
              <button
                key={level}
                onClick={() => setRiskFilter(level.toLowerCase())}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {level === 'all' ? 'All Records' : level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th scope="col" className="px-5 py-3.5">ID / Patient</th>
              <th scope="col" className="px-4 py-3.5">DOB & Age</th>
              <th scope="col" className="px-4 py-3.5">Email Address</th>
              <th scope="col" className="px-3 py-3.5 text-center">Glucose (mg/dL)</th>
              <th scope="col" className="px-3 py-3.5 text-center">Haemoglobin (g/dL)</th>
              <th scope="col" className="px-3 py-3.5 text-center">Cholesterol (mg/dL)</th>
              <th scope="col" className="px-4 py-3.5 text-center">Disease Risk</th>
              <th scope="col" className="px-5 py-3.5">AI Remarks & Condition</th>
              <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="9" className="px-6 py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Loading patient records...</span>
                  </div>
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-16 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
                      <FileText className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 mb-1">
                      No Patient Records Found
                    </h3>
                    <p className="text-xs text-slate-500 mb-5">
                      {searchTerm || riskFilter !== 'all'
                        ? 'No records match your active search or filter criteria.'
                        : 'Get started by running the 10-Entry Assessment Suite or adding a patient manually.'}
                    </p>
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={onOpenAssessmentModal}
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        Open Assessment Test Suite
                      </button>
                      <button
                        onClick={onOpenAddModal}
                        className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
                      >
                        + Add First Patient
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              patients.map((patient) => {
                const glucoseInfo = getGlucoseBadge(patient.glucose);
                const haemoInfo = getHaemoBadge(patient.haemoglobin);
                const cholInfo = getCholBadge(patient.cholesterol);

                return (
                  <tr
                    key={patient.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    {/* Patient Name & Avatar */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                          {patient.full_name
                            ?.split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {patient.full_name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            ID: #{patient.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date of Birth & Age */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-slate-800 font-medium text-xs">
                        {patient.dob}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {patient.prediction_details?.age ? `Age: ${patient.prediction_details.age} yrs` : 'Patient Record'}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-xs text-slate-600 font-mono">
                        {patient.email}
                      </span>
                    </td>

                    {/* Glucose */}
                    <td className="px-3 py-4 whitespace-nowrap text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs border ${glucoseInfo.color}`}>
                        {glucoseInfo.text}
                      </span>
                    </td>

                    {/* Haemoglobin */}
                    <td className="px-3 py-4 whitespace-nowrap text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs border ${haemoInfo.color}`}>
                        {haemoInfo.text}
                      </span>
                    </td>

                    {/* Cholesterol */}
                    <td className="px-3 py-4 whitespace-nowrap text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs border ${cholInfo.color}`}>
                        {cholInfo.text}
                      </span>
                    </td>

                    {/* Risk Level */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getRiskBadge(
                          patient.risk_level
                        )}`}
                      >
                        {patient.risk_level} Risk
                      </span>
                    </td>

                    {/* AI Remarks */}
                    <td className="px-5 py-4">
                      <div
                        onClick={() => onViewReport(patient)}
                        className="cursor-pointer max-w-xs group/remark"
                      >
                        <div className="flex items-center space-x-1 text-slate-700 text-xs font-medium hover:text-blue-600 line-clamp-2">
                          <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0 inline mr-1" />
                          <span>{patient.remarks}</span>
                        </div>
                        <span className="text-[10px] text-blue-500 font-semibold group-hover/remark:underline flex items-center mt-0.5">
                          View Health Details <ChevronRight className="h-3 w-3 ml-0.5" />
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onViewReport(patient)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Diagnostic Report"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEditPatient(patient)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Patient"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeletePatient(patient)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Patient"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Count */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-700">{patients.length}</span> patient record(s)
        </div>
        <div className="text-slate-400">
          Automated clinical decision rules & AI remarks generated on submission
        </div>
      </div>
    </div>
  );
}
