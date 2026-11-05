import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  patient,
  isDeleting,
}) {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4">
            <Trash2 className="h-6 w-6" />
          </div>

          <h3 className="text-base font-bold text-slate-900 text-center mb-2">
            Delete Patient Record?
          </h3>

          <p className="text-xs text-slate-500 text-center mb-4 leading-relaxed">
            Are you sure you want to permanently delete the patient record for{' '}
            <span className="font-bold text-slate-800">{patient.full_name}</span> (ID: #{patient.id}, {patient.email})?
            This will permanently remove their biometric data and generated AI remarks.
          </p>

          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(patient.id)}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-sm shadow-rose-500/25 transition-all disabled:opacity-50 flex items-center space-x-1.5"
            >
              {isDeleting ? (
                <>
                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Confirm Delete</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
