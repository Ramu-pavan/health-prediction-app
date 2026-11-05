import React from 'react';
import { Activity, Plus, FileCheck, RefreshCw, Server, AlertCircle } from 'lucide-react';

export default function Navbar({
  serverStatus,
  onOpenAddModal,
  onOpenAssessmentModal,
  onSeedData,
  onResetData,
  isSeeding,
  patientCount,
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Activity className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">Health Predict Pro</h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Assessment Edition
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Clinical Diagnostics & Lab Prediction Engine
              </p>
            </div>
          </div>

          {/* Action Buttons & Server Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Backend Connectivity Status Pill */}
            <div
              className={`hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                serverStatus === 'online'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : serverStatus === 'offline'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={
                serverStatus === 'online'
                  ? 'Connected to Python Flask Backend'
                  : 'Backend unreachable on http://127.0.0.1:5000'
              }
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  serverStatus === 'online'
                    ? 'bg-emerald-500 animate-pulse'
                    : serverStatus === 'offline'
                    ? 'bg-rose-500'
                    : 'bg-amber-500 animate-ping'
                }`}
              />
              <span className="capitalize">{serverStatus}</span>
            </div>

            {/* Assessment Suite (10 Entries) button */}
            <button
              onClick={onOpenAssessmentModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs sm:text-sm border border-indigo-200 transition-colors shadow-sm"
            >
              <FileCheck className="h-4 w-4 text-indigo-600" />
              <span>Assessment Test Suite</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-200 text-indigo-800 text-[10px] font-bold">
                10
              </span>
            </button>

            {/* Seed / Fast Load Data button */}
            <button
              onClick={onSeedData}
              disabled={isSeeding}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm border border-slate-200 transition-colors disabled:opacity-50"
              title="Seed database with the 5 valid assessment patients"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>Seed 5 Valid Patients</span>
            </button>

            {/* Add Patient Primary Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs sm:text-sm shadow-sm shadow-blue-500/25 transition-all"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add Patient</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
