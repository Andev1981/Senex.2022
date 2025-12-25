import React from "react";
import SearchSelect from "@/Components/SearchSelect";
import { UserPlus, Trash2, Plus } from "lucide-react";

export default function PatientCard({
  // Datos
  patients,
  insurances,
  plans,
  selectedPatientId,
  coverageDetails,
  errors,

  // Estados de Interfaz
  isImedMode,
  hasSecondaryInsurance,

  // Acciones (Handlers)
  onPatientChange,
  onCoverageChange,
  onToggleImed,
  onToggleSecondary,
  onOpenNewPatient,
}) {
  return (
    <div className="p-6 space-y-4 bg-white border border-gray-100 shadow-sm rounded-xl h-fit hover:scale-[1.01] transition-transform duration-200">
      <h2 className="flex items-center text-xl font-black text-gray-800">
        <span className="flex items-center justify-center w-8 h-8 mr-2 text-sm text-indigo-600 bg-indigo-100 rounded-full">
          1
        </span>
        Identificación Paciente
      </h2>

      {/* 1. BUSCADOR DE PACIENTE */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block mb-2 text-xs font-black text-gray-500 uppercase">
            Paciente
          </label>
          <SearchSelect
            items={patients}
            value={selectedPatientId}
            onChange={onPatientChange}
            config={{
              valueKey: "id",
              displayKey: "full_name",
              secondaryKeys: ["rut", "email"],
              searchKeys: ["name", "last_name", "rut"],
            }}
            placeholder="Buscar por nombre o RUT..."
            error={errors.patient_id}
          />
        </div>
        <button
          type="button"
          onClick={onOpenNewPatient}
          className="p-2.5 mb-[2px] text-white transition rounded-lg bg-indigo-600 hover:bg-indigo-700"
          title="Nuevo Paciente"
        >
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      {/* 2. SELECCIÓN DE PREVISIÓN */}
      <div className="pt-4 space-y-4 border-t border-gray-100">
        <label className="block mb-1 text-xs font-black text-gray-500 uppercase">
          Previsión
        </label>
        <select
          className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500"
          value={coverageDetails.insurance_id}
          onChange={(e) => onCoverageChange("insurance_id", e.target.value)}
        >
          <option value="">Particular (Sin Previsión)</option>
          {insurances.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>

        {/* 3. DETALLES DEL PLAN (Solo si hay seguro) */}
        {coverageDetails.insurance_id && (
          <div className="p-4 space-y-3 rounded-lg bg-gray-50 animate-in fade-in slide-in-from-top-2">
            {/* Header Plan + I-MED */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">
                Plan Específico
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-[10px] font-bold text-green-700 uppercase">
                  I-MED
                </span>
                <input
                  type="checkbox"
                  checked={isImedMode}
                  onChange={onToggleImed}
                  className="text-green-600 rounded focus:ring-green-500"
                />
              </label>
            </div>

            {/* Selector de Plan Primario */}
            <select
              className="w-full text-sm border-gray-200 rounded-lg"
              value={coverageDetails.plan_id}
              onChange={(e) => onCoverageChange("plan_id", e.target.value)}
            >
              <option value="">-- Seleccionar Plan --</option>
              {plans
                .filter((p) => p.insurance_id == coverageDetails.insurance_id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>

            {/* RUT del Afiliado (Nuevo) */}
            <div>
              <label className="block mb-1 text-[10px] font-black text-gray-400 uppercase">
                RUT Titular / Afiliado
              </label>
              <input
                type="text"
                className="w-full text-sm border-gray-200 rounded-lg bg-white focus:ring-indigo-500"
                placeholder="Ej: 12.345.678-9"
                value={coverageDetails.affiliate_rut}
                onChange={(e) =>
                  onCoverageChange("affiliate_rut", e.target.value)
                }
              />
            </div>

            {/* Input Código I-MED */}
            {isImedMode && (
              <input
                type="text"
                className="w-full text-sm border-green-300 rounded-lg bg-green-50 placeholder:text-green-700/50 focus:ring-green-500"
                placeholder="N° Operación / Código I-Med"
                value={coverageDetails.external_transaction_code}
                onChange={(e) =>
                  onCoverageChange("external_transaction_code", e.target.value)
                }
              />
            )}

            {/* 4. SEGURO COMPLEMENTARIO */}
            <div className="pt-2 mt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={onToggleSecondary}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                {hasSecondaryInsurance ? (
                  <Trash2 className="w-3 h-3" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
                {hasSecondaryInsurance
                  ? "Quitar Complementario"
                  : "Agregar Seguro Complementario"}
              </button>

              {hasSecondaryInsurance && (
                <div className="mt-2 space-y-2 animate-in fade-in">
                  <select
                    className="w-full text-xs border-indigo-200 rounded focus:ring-indigo-500"
                    value={coverageDetails.secondary_insurance_id}
                    onChange={(e) =>
                      onCoverageChange("secondary_insurance_id", e.target.value)
                    }
                  >
                    <option value="">Seleccionar Cía. Complementaria...</option>
                    {insurances.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="w-full text-xs border-indigo-200 rounded focus:ring-indigo-500"
                    value={coverageDetails.secondary_plan_id}
                    onChange={(e) =>
                      onCoverageChange("secondary_plan_id", e.target.value)
                    }
                  >
                    <option value="">Seleccionar Convenio...</option>
                    {plans
                      .filter(
                        (p) =>
                          p.insurance_id ==
                          coverageDetails.secondary_insurance_id
                      )
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
