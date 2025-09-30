import { Activity, Edit, FileText, Plus, User } from "lucide-react";
import React from "react";

export default function PatientCard({ patient }) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-24 h-24 border-2 bg-white/20 backdrop-blur-sm rounded-2xl border-white/30">
          <User className="w-12 h-12 text-white" />
        </div>
        <div>
          <h1 className="mb-2 text-3xl font-bold">{patient.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-teal-100">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              RUT: {patient.rut}
            </span>
            <span>•</span>
            <span>{patient.age} años</span>
            <span>•</span>
            <span>{patient.gender}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              {patient.physicalCondition.activityLevel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm">
          <Edit className="w-4 h-4" />
          Editar
        </button>
        <button className="flex items-center gap-2 px-4 py-2 font-semibold text-teal-600 transition-colors bg-white rounded-lg hover:bg-teal-50">
          <Plus className="w-4 h-4" />
          Nueva Sesión
        </button>
      </div>
    </div>
  );
}
