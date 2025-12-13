// resources/js/Pages/ChileTaxDocuments/partials/ContextSelector.jsx

import React from "react";
import { User } from "lucide-react";

// Se reciben las variables desestructuradas
export default function ContextSelector({
  data,
  setData,
  errors,
  branches,
  doctors,
  patients,
}) {
  return (
    <div className="p-4 mb-6 border-l-4 border-indigo-300 rounded-lg bg-indigo-50">
      <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
        <User className="w-5 h-5 text-indigo-600" /> Contexto Operacional y
        Profesional
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* SELECT SUCURSAL */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Sucursal
          </label>
          <select
            value={data.branch_id}
            onChange={(e) => setData("branch_id", e.target.value)}
            // ... (clases) ...
          >
            <option value={""} disabled>
              — Seleccione Sucursal —
            </option>
            {branches?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          {errors.branch_id && (
            <p className="mt-1 text-sm text-red-500">{errors.branch_id}</p>
          )}
        </div>

        {/* SELECT DOCTOR */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Doctor/Profesional
          </label>
          <select
            value={data.doctor_id}
            // ⚠️ CUIDADO: El onChange estaba mal, debe ser doctor_id
            onChange={(e) => setData("doctor_id", e.target.value)}
            // ... (clases) ...
          >
            <option value={""} disabled>
              — Seleccione Doctor —
            </option>
            {doctors?.map((d) => (
              // Asumo que tu objeto doctor tiene 'full_name' gracias al Accessor
              <option key={d.id} value={d.id}>
                {d.full_name}
              </option>
            ))}
          </select>
          {errors.doctor_id && (
            <p className="mt-1 text-sm text-red-500">{errors.doctor_id}</p>
          )}
        </div>

        {/* SELECT PACIENTE */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Paciente
          </label>
          <select
            value={data.patient_id}
            onChange={(e) => setData("patient_id", e.target.value)}
          >
            <option value={""} disabled>
              — Seleccione Paciente —
            </option>
            {patients?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </select>
          {errors.patient_id && (
            <p className="mt-1 text-sm text-red-500">{errors.patient_id}</p>
          )}
        </div>
      </div>
    </div>
  );
}
