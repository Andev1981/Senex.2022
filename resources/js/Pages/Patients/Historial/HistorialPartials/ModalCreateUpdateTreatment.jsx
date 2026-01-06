import React from "react";
import {
  Stethoscope,
  Calendar,
  Target,
  Activity,
  FileText,
  ClipboardList,
  AlertTriangle,
  AlertCircle,
  MapPin // Icono para el mapa
} from "lucide-react";
import SearchSelect from "@/Components/SearchSelect";
import BodySelector from "@/Components/BodySelector"; // IMPORTADO
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

  const activeTreatments =
    patient?.treatments?.filter((t) =>
      ["evaluation", "in_progress"].includes(t.status)
    ) || [];

  const hasActiveTreatments = activeTreatments.length > 0;

  const { data, setData, errors, post, patch, reset, processing } = useForm({
    id: selectedTreatment?.id ?? null,
    session_type_id: 1,
    patient_id: patient?.id ?? null,
    doctor_id: selectedTreatment?.doctor_id ?? null,
    diagnostic_code: selectedTreatment?.diagnostic_code ?? null,
    
    referral_doctor_name: selectedTreatment?.referral_doctor_name ?? "",
    referral_diagnosis: selectedTreatment?.referral_diagnosis ?? "",
    referral_date: selectedTreatment?.referral_date ?? null,

    body_part: selectedTreatment?.body_part ?? "",
    laterality: selectedTreatment?.laterality ?? "",
    initial_pain_level: selectedTreatment?.initial_pain_level ?? "",
    initial_pain_map: selectedTreatment?.initial_pain_map || [], // MAPA INICIAL

    description: selectedTreatment?.description ?? "",
    start_date: selectedTreatment?.start_date ?? null,
    end_date: selectedTreatment?.end_date ?? null,
    status: selectedTreatment?.status ?? "evaluation",

    total_sessions: selectedTreatment?.total_sessions ?? "",
    completed_sessions: selectedTreatment?.completed_sessions ?? 0,
    frequency: selectedTreatment?.frequency ?? "",
    frequency_time: selectedTreatment?.frequency_time ?? "month",

    is_indefinite: selectedTreatment?.is_indefinite ?? false,
    current_phase: selectedTreatment?.current_phase ?? "evaluation",
    objectives: Array.isArray(selectedTreatment?.objectives)
      ? (selectedTreatment?.objectives).join(", ")
      : selectedTreatment?.objectives ?? "",

    outcome: selectedTreatment?.outcome ?? "",
    pain_reduction: selectedTreatment?.pain_reduction ?? "",
    mobility_improvement: selectedTreatment?.mobility_improvement ?? "",
    strength_gain: selectedTreatment?.strength_gain ?? "",

    should_pause_previous: false,
  });

  const statusOptions = [
    { value: "evaluation", label: "Evaluación Inicial 📝" },
    { value: "in_progress", label: "En Progreso ⏳" },
    { value: "completed", label: "Completado ✅" },
    { value: "paused", label: "Pausado ⏸️" },
    { value: "cancelled", label: "Cancelado 🛑" },
  ];

  const fixedStates = ["completed", "cancelled", "paused"];
  const isLocked = isEditing && fixedStates.includes(data.status);

  const handleSubmit = (e) => {
    e.preventDefault();

    const opts = {
      preserveState: (page) => Object.keys(page.props.errors || {}).length > 0,
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setOpenTreatmentModal(false);
      },
      onError: () => {
        const firstErrorName = Object.keys(errors || {})[0];
        if (firstErrorName) {
          const el = document.querySelector(`[name="${firstErrorName}"]`);
          el?.focus?.();
        }
      },
    };

    if (isEditing) {
      patch(route("treatments.update", selectedTreatment.id), opts);
    } else {
      post(route("treatments.store", patient.id), opts);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 space-y-10 bg-white rounded-enterprise w-full max-w-[95vw] mx-auto" // Aumentado el ancho máximo
    >
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
          Protocolo finalizado: La estructura administrativa está bloqueada para edición.
        </div>
      )}

      {/* --- GRID DE 3 COLUMNAS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA 1: GESTIÓN Y MÉDICO */}
        <div className="space-y-8">
          <div className="p-8 border border-gray-100 rounded-[2rem] bg-gray-50/30 space-y-6">
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
              <Stethoscope className="w-4 h-4" /> Gestión Administrativa
            </h3>
            <div className="space-y-6">
              <SearchSelect
                label="Especialista Responsable *"
                options={doctors.map(d => ({ value: d.id, label: `${d.full_name || `${d.name} ${d.last_name}`} (${d.email})` }))}
                value={data?.doctor_id}
                onChange={(value) => setData("doctor_id", value)}
                placeholder="Buscar en el staff..."
                error={errors?.doctor_id}
                disabled={isLocked}
                className="!rounded-2xl"
              />

              <div className="space-y-1">
                <label className="ml-1 enterprise-label">Estado Operativo *</label>
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
              </div>

              <div className="p-6 bg-white border border-gray-100 rounded-2xl">
                <h4 className="enterprise-label mb-4">Planificación</h4>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="ml-1 enterprise-label">Fecha de Inicio</label>
                        <input
                        type="date"
                        value={fmtDateISO(data.start_date) ?? ""}
                        onChange={(e) => setData("start_date", e.target.value)}
                        className="w-full px-4 py-3 font-mono font-bold text-sm text-gray-700 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-brand-primary"
                        disabled={isLocked}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-1">
                            <label className="ml-1 enterprise-label">Sesiones</label>
                            <input
                                type="number"
                                value={data.total_sessions ?? ""}
                                onChange={(e) => setData("total_sessions", e.target.value)}
                                className="w-full px-4 py-3 font-mono font-bold text-sm text-gray-700 border-gray-200 rounded-xl focus:ring-brand-primary disabled:opacity-50"
                                disabled={isLocked || data.is_indefinite}
                                placeholder={data.is_indefinite ? "∞" : "10"}
                            />
                        </div>
                        <label className="flex items-center gap-2 mt-6 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.is_indefinite}
                                onChange={(e) => setData("is_indefinite", e.target.checked)}
                                className="w-5 h-5 border-gray-300 rounded text-brand-primary focus:ring-brand-primary"
                                disabled={isLocked}
                            />
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Indefinido</span>
                        </label>
                    </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 border border-gray-100 rounded-[2rem] bg-white space-y-6">
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Derivación
            </h3>
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="ml-1 enterprise-label">Médico</label>
                    <input
                      type="text"
                      value={data.referral_doctor_name}
                      onChange={(e) => setData("referral_doctor_name", e.target.value)}
                      className="w-full px-4 py-3 text-sm font-medium text-gray-700 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-brand-primary"
                      disabled={isLocked}
                    />
                </div>
                <div className="space-y-1">
                    <label className="ml-1 enterprise-label">Diagnóstico Ext.</label>
                    <input
                      type="text"
                      value={data.referral_diagnosis}
                      onChange={(e) => setData("referral_diagnosis", e.target.value)}
                      className="w-full px-4 py-3 text-sm font-medium text-gray-700 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-brand-primary"
                      disabled={isLocked}
                    />
                </div>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: DIAGNÓSTICO KINÉSICO (TEXTOS) */}
        <div className="space-y-8">
          <div className="p-8 border border-gray-100 rounded-[2rem] bg-white space-y-6 h-full">
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
              <FileText className="w-4 h-4" /> Diagnóstico Kinésico
            </h3>
            
            <div className="space-y-6">
              <SearchSelect
                label="Patología Detectada (CIE-10) *"
                options={diagnostics.map(d => ({ value: d.code, label: `${d.code} - ${d.description}` }))}
                value={data?.diagnostic_code}
                onChange={(value) => setData("diagnostic_code", value)}
                placeholder="Buscar patología..."
                error={errors?.diagnostic_code}
                disabled={isLocked}
                className="!rounded-2xl"
              />

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="ml-1 enterprise-label">Zona</label>
                    <input
                      type="text"
                      value={data.body_part}
                      onChange={(e) => setData("body_part", e.target.value)}
                      placeholder="Ej: Rodilla"
                      className="w-full px-4 py-3 text-sm font-bold text-gray-700 bg-white border-gray-200 rounded-xl focus:ring-brand-primary"
                      disabled={isLocked}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="ml-1 enterprise-label">Lado</label>
                    <select
                      value={data.laterality}
                      onChange={(e) => setData("laterality", e.target.value)}
                      className="w-full px-4 py-3 text-sm font-bold text-gray-700 bg-white border-gray-200 rounded-xl focus:ring-brand-primary"
                      disabled={isLocked}
                    >
                      <option value="">-</option>
                      <option value="Izquierda">Izquierda</option>
                      <option value="Derecha">Derecha</option>
                      <option value="Bilateral">Bilateral</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
              </div>

              <div className="space-y-1">
                <label className="ml-1 enterprise-label">Nivel Dolor (EVA)</label>
                <div className="flex items-center gap-4">
                    <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.initial_pain_level || 0}
                    onChange={(e) => setData("initial_pain_level", e.target.value)}
                    className="flex-1 accent-brand-primary cursor-pointer"
                    disabled={isLocked}
                    />
                    <span className="font-black text-xl text-brand-primary w-8 text-center">{data.initial_pain_level || 0}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="ml-1 enterprise-label">Plan de Trabajo / Notas</label>
                <textarea
                  value={data?.description ?? ""}
                  onChange={(e) => setData("description", e.target.value)}
                  rows="6"
                  placeholder="Detalle del plan..."
                  className="w-full px-5 py-4 text-sm font-medium text-gray-700 transition-all resize-none rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-brand-primary"
                  disabled={isLocked}
                />
              </div>

              <div className="space-y-1">
                <label className="ml-1 enterprise-label text-orange-600">Objetivos</label>
                <textarea
                  value={data.objectives ?? ""}
                  onChange={(e) => setData("objectives", e.target.value)}
                  rows="4"
                  className="w-full px-5 py-4 text-xs font-bold tracking-wide text-orange-800 uppercase transition-all bg-white border-gray-100 resize-none rounded-2xl focus:ring-orange-500 placeholder:text-orange-200"
                  disabled={isLocked}
                  placeholder="Metas terapéuticas..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA 3: MAPA CORPORAL (DEDICADA) */}
        <div className="space-y-8">
            <div className="p-8 border border-gray-100 rounded-[2rem] bg-gray-50/50 h-full flex flex-col">
                <h3 className="enterprise-label !text-brand-primary flex items-center gap-2 mb-6">
                    <MapPin className="w-4 h-4" /> Mapa del Dolor
                </h3>
                <div className="flex-1 flex items-center justify-center bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 relative overflow-hidden">
                    <div className="w-full h-full min-h-[400px]">
                        <BodySelector
                            initialData={data.initial_pain_map}
                            onChange={(newMap) => setData("initial_pain_map", newMap)}
                            mode={isLocked ? "read" : "edit"}
                        />
                    </div>
                    {!isLocked && (
                        <div className="absolute bottom-4 left-0 w-full text-center">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-white/80 backdrop-blur px-4 py-1 rounded-full inline-block shadow-sm">
                                Haga clic para marcar zonas
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>

      {/* --- RESULTADOS FINALES (FULL WIDTH) --- */}
      {isEditing && ["completed", "cancelled"].includes(data.status) && (
        <div className="p-10 border-2 border-brand-primary/20 rounded-[2.5rem] bg-brand-secondary/5 relative overflow-hidden">
          {/* ... (Contenido de resultados igual que antes) ... */}
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
