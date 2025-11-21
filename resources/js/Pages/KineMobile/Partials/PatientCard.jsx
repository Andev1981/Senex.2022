// resources/js/Pages/KineMobile/Components/PatientCard.jsx
import React from "react";
import { User, Phone, Activity, TrendingUp, ChevronRight } from "lucide-react";

export default function PatientCard({ patient, onClick }) {
  const progressPercentage =
    patient.active_treatment && patient.total_sessions > 0
      ? Math.round((patient.completed_sessions / patient.total_sessions) * 100)
      : 0;

  return (
    <div
      onClick={onClick}
      className="p-4 transition-all bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-md hover:border-teal-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white rounded-full bg-gradient-to-br from-teal-400 to-blue-500">
            {patient.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{patient.name}</h3>
            {patient.rut && (
              <p className="text-xs text-gray-600">{patient.rut}</p>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>

      {/* Contact */}
      {patient.phone && (
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{patient.phone}</span>
        </div>
      )}

      {/* Active Treatment */}
      {patient.active_treatment ? (
        <div className="p-3 mb-3 border border-teal-200 rounded-lg bg-teal-50">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-semibold text-teal-700 uppercase">
                Tratamiento activo
              </p>
              <p className="text-sm font-medium text-gray-900">
                {patient.active_treatment.session_type}
              </p>
            </div>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>

          {patient.active_treatment.diagnosis && (
            <p className="mb-2 text-xs text-gray-600">
              {patient.active_treatment.diagnosis}
            </p>
          )}

          {/* Progress */}
          {patient.active_treatment.progress !== "∞" && (
            <div>
              <div className="flex items-center justify-between mb-1 text-xs text-gray-600">
                <span>Progreso</span>
                <span className="font-medium">
                  {patient.active_treatment.progress}
                </span>
              </div>
              <div className="w-full h-2 bg-white rounded-full">
                <div
                  className="h-2 transition-all bg-teal-500 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 mb-3 text-center border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">Sin tratamiento activo</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 text-center border border-gray-200 rounded bg-gray-50">
          <p className="text-xs text-gray-600">Total sesiones</p>
          <p className="text-lg font-bold text-gray-900">
            {patient.total_sessions}
          </p>
        </div>
        <div className="p-2 text-center border border-gray-200 rounded bg-gray-50">
          <p className="text-xs text-gray-600">Completadas</p>
          <p className="text-lg font-bold text-green-600">
            {patient.completed_sessions}
          </p>
        </div>
      </div>
    </div>
  );
}
