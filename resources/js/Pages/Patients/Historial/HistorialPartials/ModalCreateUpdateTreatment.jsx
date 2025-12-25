import React from "react";
import {
  Stethoscope,
  Calendar,
  Target,
  Activity,
  FileText,
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
      className="p-3 space-y-6 bg-white dark:bg-gray-800 rounded-2xl"
    >
      {/* Encabezado */}
      <header className="pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {isEditing ? "Editar" : "Crear"} Evaluación / Tratamiento
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Paciente: <strong>{patient?.name}</strong>
        </p>

        {isLocked && (
          <div className="p-3 mt-4 text-sm font-medium text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-lg">
            ⚠️ Edición estructural bloqueada por estado finalizado.
          </div>
        )}
      </header>

      {/* --- SECCIÓN DE ADVERTENCIA (TRATAMIENTOS ACTIVOS) --- */}
      {!isEditing && hasActiveTreatments && (
        <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded-r-xl dark:bg-yellow-900/20 dark:border-yellow-600">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Tratamientos Activos Detectados
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                <p>
                  El paciente ya tiene{" "}
                  <b>{activeTreatments.length} tratamiento(s)</b> en curso.
                </p>
              </div>
              <div className="mt-4">
                <label className="flex items-center gap-3 p-2 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-lg transition">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    checked={data.should_pause_previous}
                    onChange={(e) =>
                      setData("should_pause_previous", e.target.checked)
                    }
                  />
                  <div>
                    <span className="block text-sm font-bold text-yellow-800 dark:text-yellow-200">
                      Pausar tratamientos anteriores
                    </span>
                    <span className="block text-xs text-yellow-600">
                      Marca esto si este nuevo tratamiento reemplaza a los
                      actuales. Déjalo vacío si es una lesión paralela.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 1. Información General --- */}
      <div className="p-6 border border-blue-100 rounded-xl dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20">
        <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-blue-700 dark:text-blue-400">
          <Stethoscope className="w-6 h-6" /> Información Principal
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Kinesiólogo */}
          <div className="md:col-span-1">
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
              label="Kinesiólogo a Cargo *"
              placeholder="Buscar profesional..."
              error={errors?.doctor_id}
              disabled={isLocked}
            />
          </div>

          {/* Estado */}
          <div className="md:col-span-1">
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado del Tratamiento *
            </label>
            <select
              value={data?.status}
              onChange={(e) => setData("status", e.target.value)}
              className={baseInputClasses}
              required
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status}</p>
            )}
          </div>
        </div>
      </div>

      {/* --- 2. Diagnóstico --- */}
      <div className="p-6 border border-gray-200 rounded-xl dark:border-gray-700">
        <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-purple-600 dark:text-purple-400">
          <FileText className="w-6 h-6" /> Diagnóstico y Plan
        </h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
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
              label="Diagnóstico CIE-10 *"
              placeholder="Buscar código..."
              error={errors?.diagnostic_code}
              disabled={isLocked}
            />
            <p className="mt-1 text-xs text-gray-500">
              Código seleccionado:{" "}
              <strong>{data?.diagnostic_code || "-"}</strong>
            </p>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Descripción / Plan
            </label>
            <textarea
              value={data?.description ?? ""}
              onChange={(e) => setData("description", e.target.value)}
              rows="3"
              className={baseInputClasses}
              disabled={isLocked}
              name="description" // Name para el focus en error
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* --- 3. Programación --- */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-6 border border-gray-200 rounded-xl dark:border-gray-700">
          <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-teal-600">
            <Calendar className="w-6 h-6" /> Fechas y Sesiones
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha Inicio *
              </label>
              <input
                type="date"
                value={fmtDateISO(data.start_date) ?? ""}
                onChange={(e) => setData("start_date", e.target.value)}
                className={baseInputClasses}
                disabled={isLocked}
              />
              {errors.start_date && (
                <p className="text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Total Sesiones
                </label>
                <input
                  type="number"
                  value={data.total_sessions ?? ""}
                  onChange={(e) => setData("total_sessions", e.target.value)}
                  className={baseInputClasses}
                  disabled={isLocked || data.is_indefinite}
                  placeholder={data.is_indefinite ? "∞" : "Ej: 10"}
                />
                {errors.total_sessions && (
                  <p className="text-sm text-red-600">
                    {errors.total_sessions}
                  </p>
                )}
              </div>
              <div className="flex items-center mt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.is_indefinite}
                    onChange={(e) => setData("is_indefinite", e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                    disabled={isLocked}
                  />
                  <span className="text-sm text-gray-700">Indefinido</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border border-gray-200 rounded-xl dark:border-gray-700">
          <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-orange-600">
            <Target className="w-6 h-6" /> Metas
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Objetivos
            </label>
            <textarea
              value={data.objectives ?? ""}
              onChange={(e) => setData("objectives", e.target.value)}
              rows="4"
              className={baseInputClasses}
              disabled={isLocked}
              placeholder="Ej: Reducir dolor a 2/10, Mejorar ROM de hombro..."
            />
          </div>
        </div>
      </div>

      {/* --- 4. Resultados (Solo visible si completed/interrupted o editando) --- */}
      {isEditing && ["completed", "cancelled"].includes(data.status) && (
        <div className="p-6 border border-red-200 rounded-xl bg-red-50 dark:bg-red-900/10 dark:border-red-800">
          <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-red-700">
            <Activity className="w-6 h-6" /> Resultados Finales
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">
                Dolor Final (0-10)
              </label>
              <input
                type="number"
                max="10"
                value={data.pain_reduction ?? ""}
                onChange={(e) => setData("pain_reduction", e.target.value)}
                className={baseInputClasses}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">
                Mejora Movilidad %
              </label>
              <input
                type="number"
                max="100"
                value={data.mobility_improvement ?? ""}
                onChange={(e) =>
                  setData("mobility_improvement", e.target.value)
                }
                className={baseInputClasses}
              />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                Outcome / Alta
              </label>
              <textarea
                value={data.outcome ?? ""}
                onChange={(e) => setData("outcome", e.target.value)}
                className={baseInputClasses}
                placeholder="Resumen del alta..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => setOpenTreatmentModal(false)}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={processing}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={processing}
        >
          {processing
            ? "Guardando..."
            : isEditing
            ? "Actualizar"
            : "Crear Tratamiento"}
        </button>
      </div>
    </form>
  );
}
