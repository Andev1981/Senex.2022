import React from "react";
import SearchSelect from "@/components/SearchSelect";
import EnterpriseSelect from "@/components/EnterpriseSelect";
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
  business_type = "clinical",
}) {
  const isClinical = business_type === "clinical";
  const entityLabel = isClinical ? "Paciente" : "Cliente";

  return (
    <div className="p-8 space-y-6 bg-white border border-gray-100 shadow-sm rounded-3xl h-fit hover:scale-[1.01] transition-all duration-300">
      <h2 className="flex items-center text-xl font-black text-gray-800 tracking-tight">
        <span className="flex items-center justify-center w-8 h-8 mr-3 text-xs font-black text-brand-primary bg-brand-secondary/10 rounded-xl">
          1
        </span>
        Identificación
      </h2>

      {/* 1. BUSCADOR DE ENTIDAD */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="enterprise-label ml-1">
            {entityLabel}
          </label>
          <SearchSelect
            options={patients.map(p => ({ value: p.id, label: `${p.full_name || `${p.name} ${p.last_name}`} ${p.rut ? `(${p.rut})` : ''}` }))}
            value={selectedPatientId}
            onChange={onPatientChange}
            placeholder={`Buscar ${entityLabel.toLowerCase()}...`}
            error={errors.patient_id}
            className="!rounded-2xl border-gray-100"
          />
        </div>
        <button
          type="button"
          onClick={onOpenNewPatient}
          className="p-4 mb-[2px] text-white transition-all rounded-2xl bg-brand-primary hover:brightness-110 shadow-lg shadow-brand-primary/20 active:scale-95"
          title={`Nuevo ${entityLabel}`}
        >
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      {/* 2. SELECCIÓN DE PREVISIÓN (SOLO CLÍNICO) */}
      {isClinical && (
        <div className="pt-6 space-y-5 border-t border-gray-50">
          <EnterpriseSelect
            label="Previsión / Seguro"
            value={coverageDetails.insurance_id}
            onChange={(val) => onCoverageChange("insurance_id", val)}
            options={[
              { value: "", label: "Particular (Sin Previsión)" },
              ...insurances.map((i) => ({ value: i.id, label: i.name })),
            ]}
            placeholder={null}
            className="bg-gray-50/50"
          />

          {/* 3. DETALLES DEL PLAN (Solo si hay seguro) */}
          {coverageDetails.insurance_id && (
            <div className="p-6 space-y-4 rounded-3xl bg-gray-50/50 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
              {/* Header Plan + I-MED */}
              <div className="flex items-center justify-between">
                <span className="enterprise-label !mb-0">
                  Plan Asociado
                </span>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <span className="text-[10px] font-black text-green-600 uppercase tracking-widest group-hover:text-green-700 transition-colors">
                    I-MED
                  </span>
                  <input
                    type="checkbox"
                    checked={isImedMode}
                    onChange={onToggleImed}
                    className="text-green-500 rounded-lg focus:ring-green-500 border-gray-200 w-5 h-5"
                  />
                </label>
              </div>

              {/* Selector de Plan Primario */}
              <EnterpriseSelect
                value={coverageDetails.plan_id}
                onChange={(val) => onCoverageChange("plan_id", val)}
                options={plans
                  .filter((p) => p.insurance_id == coverageDetails.insurance_id)
                  .map((p) => ({ value: p.id, label: p.name }))}
                placeholder="-- Seleccionar Plan --"
              />

              {/* RUT del Afiliado */}
              <div>
                <label className="enterprise-label ml-1">
                  RUT Titular
                </label>
                <input
                  type="text"
                  className="w-full text-sm font-bold border-gray-100 rounded-2xl bg-white focus:ring-brand-primary"
                  placeholder="Ej: 12.345.678-9"
                  value={coverageDetails.affiliate_rut}
                  onChange={(e) =>
                    onCoverageChange("affiliate_rut", e.target.value)
                  }
                />
              </div>

              {/* Input Código I-MED */}
              {isImedMode && (
                <div className="space-y-1 animate-in zoom-in-95">
                  <label className="enterprise-label !text-green-600 ml-1">N° Operación I-Med</label>
                  <input
                    type="text"
                    className="w-full text-sm font-mono font-black border-green-100 rounded-2xl bg-green-50 text-green-700 placeholder:text-green-700/30 focus:ring-green-500 focus:border-green-500"
                    placeholder="00000000"
                    value={coverageDetails.external_transaction_code}
                    onChange={(e) =>
                      onCoverageChange("external_transaction_code", e.target.value)
                    }
                  />
                </div>
              )}

              {/* 4. SEGURO COMPLEMENTARIO */}
              <div className="pt-4 mt-2 border-t border-gray-200/50">
                <button
                  type="button"
                  onClick={onToggleSecondary}
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                    hasSecondaryInsurance ? "text-red-500 hover:text-red-600" : "text-brand-primary hover:brightness-110"
                  }`}
                >
                  {hasSecondaryInsurance ? (
                    <Trash2 className="w-3 h-3" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                  {hasSecondaryInsurance
                    ? "Quitar Complementario"
                    : "Agregar Complementario"}
                </button>

                {hasSecondaryInsurance && (
                  <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <EnterpriseSelect
                      value={coverageDetails.secondary_insurance_id}
                      onChange={(val) =>
                        onCoverageChange("secondary_insurance_id", val)
                      }
                      options={insurances.map((i) => ({ value: i.id, label: i.name }))}
                      placeholder="Seleccionar Cía..."
                    />
                    <EnterpriseSelect
                      value={coverageDetails.secondary_plan_id}
                      onChange={(val) =>
                        onCoverageChange("secondary_plan_id", val)
                      }
                      options={plans
                        .filter(
                          (p) =>
                            p.insurance_id ==
                            coverageDetails.secondary_insurance_id
                        )
                        .map((p) => ({ value: p.id, label: p.name }))}
                      placeholder="Seleccionar Convenio..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
