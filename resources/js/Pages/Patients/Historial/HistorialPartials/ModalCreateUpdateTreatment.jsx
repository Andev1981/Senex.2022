import React from "react";
import {
  Stethoscope,
  Calendar,
  Target,
  Activity,
  FileText,
  ClipboardList,
  AlertTriangle, // <--- Importamos el icono de alerta
} from "lucide-react";
import SearchSelect from "@/Components/SearchSelect";
import { useForm } from "@inertiajs/react";
import { TREATMENT_CURRENT_PHASE_OPTIONS } from "@/constants/treatmentCurrentPhases";
import { fmtDateISO } from "@/utils/utils";

export default function ModalCreateUpdateTreatment({
  patient,
  selectedTreatment,
  doctors,
  setOpenTreatmentModal,
  diagnostics,
}) {
  const isEditing = !!selectedTreatment?.id;

  // 1. Detectar Tratamientos Activos (Para lógica de pausa)
  const activeTreatments =
    patient?.treatments?.filter((t) =>
      ["evaluation", "in_progress"].includes(t.status)
    ) || [];

  const hasActiveTreatments = activeTreatments.length > 0;

  // 2. Inicializar el Formulario (useForm maneja Axios internamente)
  const { data, setData, errors, post, patch, reset, processing } = useForm({
    id: selectedTreatment?.id ?? null,
    session_type_id: 1,
    patient_id: patient?.id ?? null,
    doctor_id: selectedTreatment?.doctor_id ?? null,
    diagnostic_code: selectedTreatment?.diagnostic_code ?? null,
    description: selectedTreatment?.description ?? "",
    start_date: selectedTreatment?.start_date ?? null,
    end_date: selectedTreatment?.end_date ?? null,
    status: selectedTreatment?.status ?? "evaluation",

    // Inputs Numéricos (evitar nulls en inputs controlados)
    total_sessions: selectedTreatment?.total_sessions ?? "",
    completed_sessions: selectedTreatment?.completed_sessions ?? 0,
    frequency: selectedTreatment?.frequency ?? "",
    frequency_time: selectedTreatment?.frequency_time ?? "month",

    is_indefinite: selectedTreatment?.is_indefinite ?? false,
    current_phase: selectedTreatment?.current_phase ?? "evaluation",
    objectives: Array.isArray(selectedTreatment?.objectives)
      ? (selectedTreatment?.objectives).join(", ")
      : selectedTreatment?.objectives ?? "",

    // Resultados (evitar nulls)
    outcome: selectedTreatment?.outcome ?? "",
    pain_reduction: selectedTreatment?.pain_reduction ?? "",
    mobility_improvement: selectedTreatment?.mobility_improvement ?? "",
    strength_gain: selectedTreatment?.strength_gain ?? "",

    // Nuevo campo para pausar anteriores
    should_pause_previous: false,
  });

  const statusOptions = [
    { value: "evaluation", label: "Evaluación Inicial 📝" },
    { value: "in_progress", label: "En Progreso ⏳" },
    { value: "completed", label: "Completado ✅" },
    { value: "paused", label: "Pausado ⏸️" },
    { value: "cancelled", label: "Cancelado 🛑" },
  ];

  const frequencyTimeOptions = [
    { value: "day", label: "Días" },
    { value: "week", label: "Semanas" },
    { value: "month", label: "Meses" },
  ];

  const fixedStates = ["completed", "cancelled", "paused"];
  const isLocked = isEditing && fixedStates.includes(data.status);

  const baseInputClasses =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white";

  // --- Manejo del Envío ---
  const handleSubmit = (e) => {
    e.preventDefault();

    const opts = {
      preserveState: (page) => Object.keys(page.props.errors || {}).length > 0,
      preserveScroll: true,
      onSuccess: () => {
        // Aquí puedes disparar una notificación Toast si tienes una librería
        // Ej: toast.success('Tratamiento guardado correctamente');
        reset();
        setOpenTreatmentModal(false);
      },
      onError: () => {
        // Enfocar el primer error
        const firstErrorName = Object.keys(errors || {})[0];
        if (firstErrorName) {
          const el = document.querySelector(`[name="${firstErrorName}"]`);
          el?.focus?.();
        }
      },
    };

    // Inertia usa "post" y "patch" que son wrappers de Axios
    if (isEditing) {
      patch(route("treatments.update", selectedTreatment.id), opts);
    } else {
      // Importante: Asegúrate que tu ruta acepte patient_id o que lo lea del body (data.patient_id)
      post(route("treatments.store", patient.id), opts);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 space-y-10 bg-white rounded-enterprise"
    >
      {/* Encabezado Enterprise */}
      <header className="flex items-center justify-between pb-8 border-b border-gray-100">
        <div>
          <h1 className="mb-2 text-3xl font-black leading-none tracking-tight text-gray-900 uppercase">
            {isEditing ? "Optimizar" : "Nuevo"} Protocolo Clínico
          </h1>
          <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
            Paciente:{" "}
            <span className="text-brand-primary">
              {patient?.name} {patient?.last_name}
            </span>
          </p>
        </div>
        <div className="flex items-center justify-center w-16 h-16 bg-brand-secondary/10 text-brand-primary rounded-[1.5rem] transform rotate-6">
          <ClipboardList className="w-8 h-8" />
        </div>
      </header>

      {isLocked && (
        <div className="flex items-center gap-4 p-6 text-xs font-black tracking-widest uppercase border-2 text-amber-700 bg-amber-50 border-amber-100 rounded-3xl animate-pulse">
          <AlertCircle className="w-6 h-6 shrink-0" />
          Protocolo finalizado: La estructura administrativa está bloqueada para
          edición.
        </div>
      )}

      {/* --- SECCIÓN DE ADVERTENCIA (TRATAMIENTOS ACTIVOS) --- */}
      {!isEditing && hasActiveTreatments && (
        <div className="p-8 border-2 border-orange-100 bg-orange-50/30 rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 -mt-12 -mr-12 rounded-full bg-orange-200/20 blur-2xl"></div>
          <div className="relative z-10 flex gap-6">
            <div className="flex-shrink-0">
              <div className="p-3 text-orange-500 bg-white shadow-sm rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-sm font-black tracking-tight text-orange-800 uppercase">
                Continuidad de Atención
              </h3>
              <p className="mb-6 text-xs font-medium leading-relaxed text-orange-700/80">
                Hemos detectado <b>{activeTreatments.length} plan(es)</b>{" "}
                vigentes. ¿Este nuevo registro reemplaza la atención actual o es
                una patología paralela?
              </p>

              <label className="flex items-center gap-4 p-4 transition-all border-2 border-orange-100 cursor-pointer bg-white/60 hover:bg-white rounded-2xl group">
                <input
                  type="checkbox"
                  className="w-6 h-6 text-orange-600 border-orange-200 rounded-xl focus:ring-orange-500"
                  checked={data.should_pause_previous}
                  onChange={(e) =>
                    setData("should_pause_previous", e.target.checked)
                  }
                />
                <div>
                  <span className="block text-xs font-black tracking-widest text-orange-900 uppercase">
                    Pausar planes anteriores
                  </span>
                  <span className="block text-[10px] text-orange-600 font-bold uppercase opacity-60">
                    Archivar casos previos para priorizar esta nueva evaluación
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* --- 1. Información General --- */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="p-8 border border-gray-100 rounded-[2rem] bg-gray-50/30 space-y-6">
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
              <Stethoscope className="w-4 h-4" /> Asignación Médica
            </h3>
            <div className="space-y-6">
              {/* Kinesiólogo */}
              <SearchSelect
                items={doctors}
                value={data?.doctor_id}
                onChange={(value) => setData("doctor_id", value)}
                config={{
                  valueKey: "id",
                  displayKey: "full_name",
                  secondaryKeys: ["email"],
                  searchKeys: ["name", "last_name"],
                }}
                label="Especialista Responsable *"
                placeholder="Buscar en el staff..."
                error={errors?.doctor_id}
                disabled={isLocked}
                className="!rounded-2xl"
              />

              {/* Estado */}
              <div className="space-y-1">
                <label className="ml-1 enterprise-label">
                  Estado Operativo *
                </label>
                <select
                  value={data?.status}
                  onChange={(e) => setData("status", e.target.value)}
                  className="w-full px-5 py-4 text-sm font-bold text-gray-700 transition-all bg-white border-gray-100 rounded-2xl focus:ring-brand-primary"
                  required
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1 text-[10px] font-black text-red-600 uppercase tracking-widest">
                    {errors.status}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Programación */}
          <div className="p-8 border border-gray-100 rounded-[2rem] bg-white shadow-inner space-y-6">
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Planificación
            </h3>
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="ml-1 enterprise-label">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  value={fmtDateISO(data.start_date) ?? ""}
                  onChange={(e) => setData("start_date", e.target.value)}
                  className="w-full px-5 py-4 font-mono font-black text-gray-700 transition-all rounded-2xl border-gray-50 bg-gray-50/50 focus:bg-white focus:ring-brand-primary"
                  disabled={isLocked}
                />
                {errors.start_date && (
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                    {errors.start_date}
                  </p>
                )}
              </div>

              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-1">
                  <label className="ml-1 text-gray-400 enterprise-label">
                    Total Sesiones
                  </label>
                  <input
                    type="number"
                    value={data.total_sessions ?? ""}
                    onChange={(e) => setData("total_sessions", e.target.value)}
                    className="w-full px-5 py-4 font-mono font-black text-gray-700 transition-all border-gray-100 rounded-2xl focus:ring-brand-primary disabled:bg-gray-100 disabled:opacity-40"
                    disabled={isLocked || data.is_indefinite}
                    placeholder={data.is_indefinite ? "∞" : "10"}
                  />
                </div>
                <label className="flex items-center gap-3 mb-4 cursor-pointer group shrink-0">
                  <input
                    type="checkbox"
                    checked={data.is_indefinite}
                    onChange={(e) => setData("is_indefinite", e.target.checked)}
                    className="w-6 h-6 border-gray-200 rounded-xl text-brand-primary focus:ring-brand-primary"
                    disabled={isLocked}
                  />
                  <span className="text-[10px] font-black text-brand-gray uppercase tracking-widest group-hover:text-brand-primary transition-colors">
                    Indefinido
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="space-y-8">
          {/* Diagnóstico */}
          <div className="p-8 border border-gray-100 rounded-[2rem] bg-white space-y-6">
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
              <FileText className="w-4 h-4" /> Diagnóstico SII/CIE-10
            </h3>
            <div className="space-y-6">
              <SearchSelect
                items={diagnostics}
                value={data?.diagnostic_code}
                onChange={(value) => setData("diagnostic_code", value)}
                config={{
                  valueKey: "code",
                  displayKey: "description",
                  secondaryKeys: ["code"],
                  searchKeys: ["code", "description"],
                }}
                label="Patología Detectada *"
                placeholder="Buscar en el catálogo oficial..."
                error={errors?.diagnostic_code}
                disabled={isLocked}
                className="!rounded-2xl"
              />

              <div className="space-y-1">
                <label className="ml-1 enterprise-label">
                  Observaciones / Plan de Trabajo
                </label>
                <textarea
                  value={data?.description ?? ""}
                  onChange={(e) => setData("description", e.target.value)}
                  rows="4"
                  placeholder="Describa el plan de tratamiento detallado..."
                  className="w-full px-5 py-4 text-sm font-medium text-gray-700 transition-all resize-none rounded-2xl border-gray-50 bg-gray-50/50 focus:bg-white focus:ring-brand-primary"
                  disabled={isLocked}
                />
              </div>
            </div>
          </div>

          {/* Metas */}
          <div className="p-8 border border-gray-100 rounded-[2rem] bg-slate-50/50 space-y-6">
            <h3 className="enterprise-label !text-orange-600 flex items-center gap-2">
              <Target className="w-4 h-4" /> Objetivos Terapéuticos
            </h3>
            <textarea
              value={data.objectives ?? ""}
              onChange={(e) => setData("objectives", e.target.value)}
              rows="4"
              className="w-full px-5 py-4 text-xs font-bold tracking-wide text-orange-800 uppercase transition-all bg-white border-gray-100 resize-none rounded-2xl focus:ring-orange-500 placeholder:text-orange-200"
              disabled={isLocked}
              placeholder="EJ: REDUCIR DOLOR A 2/10, MEJORAR RANGO DE MOVIMIENTO..."
            />
          </div>
        </div>
      </div>

      {/* --- 4. Resultados Finales --- */}
      {isEditing && ["completed", "cancelled"].includes(data.status) && (
        <div className="p-10 border-2 border-brand-primary/20 rounded-[2.5rem] bg-brand-secondary/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-primary/5 to-transparent"></div>
          <h3 className="relative z-10 flex items-center gap-3 mb-8 text-xl font-black tracking-tight uppercase text-brand-primary">
            <Activity className="w-6 h-6" /> Resultados de Evolución
          </h3>
          <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="space-y-1">
              <label className="ml-1 enterprise-label">
                Dolor Final (VAS 0-10)
              </label>
              <input
                type="number"
                max="10"
                value={data.pain_reduction ?? ""}
                onChange={(e) => setData("pain_reduction", e.target.value)}
                className="w-full px-5 py-4 text-lg font-black text-gray-900 border-gray-100 rounded-2xl focus:ring-brand-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="ml-1 enterprise-label">
                Mejora Movilidad (%)
              </label>
              <input
                type="number"
                max="100"
                value={data.mobility_improvement ?? ""}
                onChange={(e) =>
                  setData("mobility_improvement", e.target.value)
                }
                className="w-full px-5 py-4 text-lg font-black text-gray-900 border-gray-100 rounded-2xl focus:ring-brand-primary"
              />
            </div>
            <div className="col-span-1 space-y-1 md:col-span-3">
              <label className="ml-1 enterprise-label">
                Outcome / Resumen de Alta
              </label>
              <textarea
                value={data.outcome ?? ""}
                onChange={(e) => setData("outcome", e.target.value)}
                className="w-full px-5 py-4 text-sm font-medium text-gray-700 transition-all bg-white border-gray-100 resize-none rounded-2xl focus:ring-brand-primary"
                placeholder="Indique los resultados finales y recomendaciones post-alta..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Botones Enterprise */}
      <div className="flex justify-end gap-4 pt-10 border-t border-gray-100">
        <button
          type="button"
          onClick={() => setOpenTreatmentModal(false)}
          className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brand-gray hover:bg-gray-50 rounded-2xl transition-all"
          disabled={processing}
        >
          Descartar
        </button>
        <button
          type="submit"
          className="px-12 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-brand-primary rounded-2xl shadow-xl shadow-brand-primary/20 hover:brightness-110 disabled:opacity-50 transition-all active:scale-95 transform"
          disabled={processing}
        >
          {processing
            ? "Procesando..."
            : isEditing
            ? "Actualizar Protocolo"
            : "Registrar Tratamiento"}
        </button>
      </div>
    </form>
  );
}
