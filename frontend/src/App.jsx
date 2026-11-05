import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import PatientTable from './components/PatientTable';
import PatientModal from './components/PatientModal';
import AssessmentSuiteModal from './components/AssessmentSuiteModal';
import HealthReportModal from './components/HealthReportModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { api } from './services/api';
import { CheckCircle2, AlertCircle, Info, RefreshCw } from 'lucide-react';

export default function App() {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState('connecting');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editPatient, setEditPatient] = useState(null);

  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [viewPatient, setViewPatient] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Load Data
  const fetchData = useCallback(async () => {
    try {
      const [healthRes, patientsRes, statsRes] = await Promise.allSettled([
        api.getHealth(),
        api.getPatients(searchTerm, riskFilter),
        api.getStats(),
      ]);

      if (healthRes.status === 'fulfilled') {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }

      if (patientsRes.status === 'fulfilled') {
        setPatients(patientsRes.value.data || []);
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data || null);
      }
    } catch (err) {
      setServerStatus('offline');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, riskFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditPatient(null);
    setIsAddEditOpen(true);
  };

  const handleEditPatient = (patient) => {
    setEditPatient(patient);
    setIsAddEditOpen(true);
  };

  const handleViewReport = (patient) => {
    setViewPatient(patient);
    setIsReportOpen(true);
  };

  const handleDeletePrompt = (patient) => {
    setDeleteTarget(patient);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async (patientId) => {
    setIsDeleting(true);
    try {
      await api.deletePatient(patientId);
      showToast('Patient record deleted successfully.');
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to delete record.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeedValidData = async () => {
    setIsSeeding(true);
    try {
      const res = await api.seedAssessmentSuite(true);
      showToast(
        `Seeded ${res.seeded_count} valid assessment records. Caught ${res.rejected_count} intentional invalid test entries!`,
        'success'
      );
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to seed assessment data.', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all records from the database?')) {
      try {
        await api.resetDatabase();
        showToast('Database reset successfully.');
        fetchData();
      } catch (err) {
        showToast(err.message || 'Failed to reset.', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
              toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700 shadow-rose-500/20'
                : 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/20'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        serverStatus={serverStatus}
        onOpenAddModal={handleOpenAddModal}
        onOpenAssessmentModal={() => setIsAssessmentOpen(true)}
        onSeedData={handleSeedValidData}
        onResetData={handleResetData}
        isSeeding={isSeeding}
        patientCount={patients.length}
      />

      {/* Offline Alert Banner if backend is not detected */}
      {serverStatus === 'offline' && (
        <div className="bg-rose-500 text-white py-2.5 px-4 text-xs font-medium text-center shadow-inner flex items-center justify-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <span>
            Backend connection unreachable at <code className="bg-rose-600 px-1 py-0.5 rounded">http://127.0.0.1:5000</code>.
            Please ensure the Python Flask server is running (<code className="bg-rose-600 px-1 py-0.5 rounded">python app.py</code>).
          </span>
          <button
            onClick={fetchData}
            className="ml-2 underline font-bold hover:text-rose-100"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome & Assessment Guide Banner */}
        <div className="mb-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/10 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
              Healthcare AI Assessment Platform
            </span>
            <h2 className="text-xl sm:text-2xl font-bold mt-2 tracking-tight">
              Patient Disease Risk Prediction & Validation System
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1 leading-relaxed">
              Full CRUD management with automated biometric evaluation (Glucose, Haemoglobin, Cholesterol).
              Includes the complete 10-entry assessment verification suite ranging from Robyn Pears to Prem Kumar.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsAssessmentOpen(true)}
                className="px-4 py-2 rounded-lg bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-sm transition-all"
              >
                Run Assessment Test Suite (10 Cases)
              </button>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs border border-white/20 transition-all"
              >
                + Register New Patient
              </button>
            </div>
          </div>
          {/* Subtle background glow */}
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        </div>

        {/* Dashboard Aggregate Metric Cards */}
        <StatsOverview stats={stats} loading={loading} />

        {/* Patient Table with Search, Filter & Actions */}
        <PatientTable
          patients={patients}
          loading={loading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          riskFilter={riskFilter}
          setRiskFilter={setRiskFilter}
          onViewReport={handleViewReport}
          onEditPatient={handleEditPatient}
          onDeletePatient={handleDeletePrompt}
          onOpenAddModal={handleOpenAddModal}
          onOpenAssessmentModal={() => setIsAssessmentOpen(true)}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-700">Health Predict Pro</span> &copy; {new Date().getFullYear()} &bull; Full-Stack Python & React Assessment Application
          </div>
          <div className="text-[11px] text-slate-400">
            Compliant with WHO Anemia, ADA Glycemic, and AHA Lipid Clinical Reference Ranges
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PatientModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditPatient(null);
        }}
        onSuccess={() => {
          showToast(
            editPatient
              ? 'Patient updated successfully with re-evaluated AI remarks!'
              : 'New patient registered and AI health remarks generated!',
            'success'
          );
          fetchData();
        }}
        editPatient={editPatient}
      />

      <AssessmentSuiteModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        onRefreshPatients={fetchData}
      />

      <HealthReportModal
        isOpen={isReportOpen}
        onClose={() => {
          setIsReportOpen(false);
          setViewPatient(null);
        }}
        patient={viewPatient}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        patient={deleteTarget}
        isDeleting={isDeleting}
      />
    </div>
  );
}
