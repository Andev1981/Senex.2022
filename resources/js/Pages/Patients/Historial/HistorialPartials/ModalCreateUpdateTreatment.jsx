import React from "react";
import {
  Stethoscope,
  Calendar,
  Target,
  Activity,
  FileText,
} from "lucide-react";
import SearchSelect from "@/Components/SearchSelect";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import TextInputNumber from "@/Components/TextInputNumber";
import PrimaryButton from "@/Components/PrimaryButton";
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
  // ... (Inicialización de useForm y datos - Sin cambios)
  const isEditing = !!selectedTreatment?.id;

  const { data, setData, errors, post, patch, reset, processing } = useForm({
    id: selectedTreatment?.id || null,
    session_type_id: 1,
    patient_id: patient?.id,
    doctor_id: selectedTreatment?.doctor_id ?? null,
    diagnostic_code: selectedTreatment?.diagnostic_code ?? null,
    description: selectedTreatment?.description ?? null,
    start_date: selectedTreatment?.start_date ?? null,
    end_date: selectedTreatment?.end_date ?? null,
    status: selectedTreatment?.status ?? "evaluation",
    total_sessions: selectedTreatment?.total_sessions ?? null,
    completed_sessions: selectedTreatment?.completed_sessions ?? null,
    frequency: selectedTreatment?.frequency ?? null,
    frequency_time: selectedTreatment?.frequency_time ?? "month",
    is_indefinite: selectedTreatment?.is_indefinite ?? false,
    current_phase: selectedTreatment?.current_phase ?? "evaluation",
    objectives: Array.isArray(selectedTreatment?.objectives)
      ? (selectedTreatment?.objectives).join(", ")
      : selectedTreatment?.objectives ?? "",
    outcome: selectedTreatment?.outcome ?? null,
    pain_reduction: selectedTreatment?.pain_reduction ?? null,
    mobility_improvement: selectedTreatment?.mobility_improvement ?? null,
    strength_gain: selectedTreatment?.strength_gain ?? null,
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

  // --- Lógica de Bloqueo de Edición (Mantenida) ---
  const fixedStates = ["completed", "cancelled", "paused"];
  const isLocked = isEditing && fixedStates.includes(data.status);

  // Clases base para inputs nativos (sin estilos de bloqueo)
  const baseInputClasses =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white";

  // --- 2. Manejo del Envío (Submit Handler) ---
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
        // Mantener modal abierto (no lo cierres aquí)
        // Opcional: enfocar el primer campo con error
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
  }; // --- 3. Renderizado del Formulario ---

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 space-y-6 bg-white dark:bg-gray-800 rounded-2xl"
    >
      {/* Encabezado del Formulario */}
      <header className="pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {isEditing ? "Editar" : "Crear"} Evaluación / Tratamiento
          Kinesiológico
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Completa los detalles del plan de tratamiento para **
          {patient?.name}**.
        </p>
        {/* Aviso de Bloqueo */}
        {isLocked && (
          <div className="p-3 mt-4 text-sm font-medium text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-lg dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700">
            ⚠️ **Edición de la estructura del tratamiento bloqueada.** Solo es
            posible modificar el **Estado** y los **Resultados Finales** (si
            aplica).
          </div>
        )}{" "}
      </header>
      {/* --- 1. Información General y Profesional --- */}
      <div className="p-6 border border-blue-100 rounded-xl dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20">
        <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-blue-700 dark:text-blue-400">
          <Stethoscope className="w-6 h-6" /> Información Principal
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Kinesiolog@ (Doctor) - Bloqueado */}
          <div className="md:col-span-2">
            <SearchSelect
              items={doctors}
              value={data.doctor_id}
              onChange={(value) => setData("doctor_id", value)}
              config={{
                valueKey: "id",
                displayKey: "full_name",
                secondaryKeys: ["email", "phone"],
                searchKeys: ["name", "last_name", "email", "full_name"],
              }}
              label="Kinesiolog@ a Cargo *"
              placeholder="Buscar Kinesiólogo..."
              error={errors.doctor_id}
              disabled={isLocked} // Bloqueo aplicado
            />
          </div>
          {/* Estado del Tratamiento - SIEMPRE EDITABLE */}
          <div className="md:col-span-2">
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado del Tratamiento *
            </label>
            <select
              value={data.status}
              onChange={(e) => setData("status", e.target.value)}
              className={`${baseInputClasses} focus:ring-blue-500`}
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
      {/* --- 2. Diagnóstico y Descripción --- */}
      <div className="p-6 border border-gray-200 rounded-xl dark:border-gray-700">
        <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-purple-600 dark:text-purple-400">
          <FileText className="w-6 h-6" /> Diagnóstico y Plan 
        </h3>

        <div className="grid grid-cols-1 gap-6">
          {/* Diagnóstico - Bloqueado */}  
          <div className="md:col-span-2">
            <SearchSelect
              items={diagnostics}
              value={data.diagnostic_code}
              onChange={(value) => setData("diagnostic_code", value)}
              config={{
                valueKey: "code",
                displayKey: "description",
                secondaryKeys: ["code"],
                searchKeys: ["code", "description"],
              }}
              label="Diagnóstico Principal (CIE-10) * "
              placeholder="Buscar código..."
              error={errors.diagnostic_code}
              disabled={isLocked} // Bloqueo aplicado
            />
            <span className="flex text-sm italic text-gray-400">
              Código(CIE-10):{" "}
              <p className="pl-2 font-bold">{data.diagnostic_code}</p>
            </span>
          </div>
          {/* Descripción - Bloqueado */}  
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Descripción / Plan de Intervención
            </label>

            <textarea
              value={data.description}
              onChange={(e) => setData("description", e.target.value)}
              rows="4"
              placeholder="Detalle del plan de tratamiento y las áreas a abordar..."
              className={`${baseInputClasses} focus:ring-purple-500`}
              disabled={isLocked} // Bloqueo aplicado
            />

            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
          {/* Nota: Asumo que tus componentes Input y Textarea tienen la variante 'disabled:' */}
          {/* en su Tailwind config para estilizarse automáticamente cuando la prop disabled es true. */}
        </div>
      </div>
      {/* --- 3. Programación y Metas --- */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Fechas y Sesiones */}
        <div className="p-6 border border-gray-200 rounded-xl dark:border-gray-700">
          <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-teal-600 dark:text-teal-400">
            <Calendar className="w-6 h-6" /> Programación
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Fecha de Inicio - Bloqueado */} 
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                value={fmtDateISO(data.start_date)}
                onChange={(e) => setData("start_date", e.target.value)}
                className={`${baseInputClasses} focus:ring-teal-500`}
                required
                disabled={isLocked} // Bloqueo aplicado
              />

              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>
            {/* Fecha de Término - Bloqueado */} 
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Fecha de Término
              </label>

              <input
                type="date"
                value={fmtDateISO(data.end_date)}
                onChange={(e) => setData("end_date", e.target.value)}
                className={`${baseInputClasses} focus:ring-teal-500`}
                disabled={isLocked} // Bloqueo aplicado
              />

              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>
            {/* Total de Sesiones - Bloqueado */} 
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Total de Sesiones Estimadas
              </label>

              <input
                type="number"
                min="1"
                value={data.total_sessions}
                onChange={(e) =>
                  setData("total_sessions", parseInt(e.target.value) || null)
                }
                placeholder="Ej: 2"
                className={`${baseInputClasses} focus:ring-teal-500`}
                disabled={isLocked} // Bloqueo aplicado
              />

              {errors.total_sessions && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.total_sessions}
                </p>
              )}
            </div>
            {/* Sesiones Completadas (ReadOnly) */} 
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Sesiones Completadas
              </label>

              <input
                type="number"
                value={data.completed_sessions || 0}
                readOnly
                disabled // Siempre deshabilitado
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
              />
            </div>
            {/* Tratamiento Indefinido - Bloqueado */} 
            <div className="flex items-center col-span-2 mt-2">
              <input
                type="checkbox"
                id="is_indefinite"
                checked={data.is_indefinite}
                onChange={(e) => setData("is_indefinite", e.target.checked)}
                className={`w-4 h-4 border-gray-300 rounded focus:ring-teal-500 dark:bg-gray-700 dark:border-gray-600 text-teal-600`}
                disabled={isLocked} // Bloqueo aplicado
              />

              <label
                htmlFor="is_indefinite"
                className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tratamiento Indefinido / Crónico
              </label>
            </div>
          </div>
        </div>
        {/* Frecuencia y Objetivos */}
        <div className="p-6 border border-gray-200 rounded-xl dark:border-gray-700">
          <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-orange-600 dark:text-orange-400">
            <Target className="w-6 h-6" /> Frecuencia y Objetivos
          </h3>

          <div className="grid grid-cols-3 gap-4">
            {/* Frecuencia (Número) - Bloqueado */} 
            <div className="col-span-1">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Frecuencia
              </label>

              <input
                type="number"
                min="1"
                value={data.frequency}
                onChange={(e) =>
                  setData("frequency", parseInt(e.target.value) || null)
                }
                placeholder="Ej: 2"
                className={`${baseInputClasses} focus:ring-orange-500`}
                disabled={isLocked} // Bloqueo aplicado
              />

              {errors.frequency && (
                <p className="mt-1 text-sm text-red-600">{errors.frequency}</p>
              )}
            </div>
            {/* Frecuencia (Tiempo) - Bloqueado */} 
            <div className="col-span-2">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Período
              </label>

              <select
                value={data.frequency_time}
                onChange={(e) => setData("frequency_time", e.target.value)}
                className={`${baseInputClasses} focus:ring-orange-500`}
                disabled={isLocked} // Bloqueo aplicado
              >
                {frequencyTimeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Por {option.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Fase Actual - Bloqueado */} 
            <div className="col-span-3">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Fase Actual
              </label>
              <select
                value={data.current_phase}
                onChange={(e) => setData("current_phase", e.target.value)}
                className={`${baseInputClasses} focus:ring-orange-500`}
                disabled={isLocked} // Bloqueo aplicado
              >
                {TREATMENT_CURRENT_PHASE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Objetivos - Bloqueado */} 
            <div className="col-span-3">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Objetivos del Tratamiento (Separados por coma)
              </label>

              <textarea
                value={data.objectives}
                onChange={(e) => setData("objectives", e.target.value)}
                rows="3"
                placeholder="Ej: Recuperar 90° de ROM de hombro, Eliminar dolor al cargar peso"
                className={`${baseInputClasses} focus:ring-orange-500`}
                disabled={isLocked} // Bloqueo aplicado
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- 4. Resultados y Finalización (Solo visible al completar/interrumpir) --- */}

      {isEditing &&
        (data.status === "completed" || data.status === "interrupted") && (
          <div className="p-6 border border-red-300 rounded-xl bg-red-50 dark:border-red-700 dark:bg-red-900/10">
            <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-red-700 dark:text-red-400">
              <Activity className="w-6 h-6" /> Resultados Finales
            </h3>

            <p className="mb-4 text-sm text-red-700 dark:text-red-300">
              Rellenar solo si el tratamiento ha sido **Completado** o
              **Interrumpido**.
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Reducción de Dolor */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reducción de Dolor (%)
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={data.pain_reduction}
                  onChange={(e) =>
                    setData("pain_reduction", parseInt(e.target.value) || null)
                  }
                  placeholder="Ej: 80"
                  className={`${baseInputClasses} focus:ring-red-500`}
                />
              </div>
              {/* Mejora de Movilidad */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mejora de Movilidad (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={data.mobility_improvement}
                  onChange={(e) =>
                    setData(
                      "mobility_improvement",
                      parseInt(e.target.value) || null
                    )
                  }
                  placeholder="Ej: 95"
                  className={`${baseInputClasses} focus:ring-red-500`}
                />
              </div>
              {/* Ganancia de Fuerza */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ganancia de Fuerza (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={data.strength_gain}
                  onChange={(e) =>
                    setData("strength_gain", parseInt(e.target.value) || null)
                  }
                  placeholder="Ej: 70"
                  className={`${baseInputClasses} focus:ring-red-500`}
                />
              </div>
            </div>
            {/* Resultado Final */}
            <div className="mt-6">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Resultado Final del Tratamiento (*Outcome*)
              </label>
              <textarea
                value={data.outcome}
                onChange={(e) => setData("outcome", e.target.value)}
                rows="3"
                placeholder="Resumen del resultado final y alta del paciente."
                className={`${baseInputClasses} focus:ring-red-500`}
              />
            </div>
          </div>
        )}
      {/* --- Botones de Acción --- */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        {/* Botón de Cancelar */}
        <button
          onClick={() => setOpenTreatmentModal(false)}
          type="button"
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          disabled={processing}
        >
          Cancelar
        </button>
        {/* Botón de Enviar */}
        <button
          type="submit"
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={processing}
        >
          {processing
            ? isEditing
              ? "Actualizando..."
              : "Creando..."
            : isEditing
            ? "Actualizar Tratamiento"
            : "Crear Tratamiento"}
        </button>
      </div>
    </form>
  );
}
