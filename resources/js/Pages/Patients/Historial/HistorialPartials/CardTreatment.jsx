import { Dumbbell, Edit, Stethoscope, Tag, Target, Timer } from "lucide-react";
import { fmtDateISO, pct } from "@/utils/utils";
import { statusColors } from "@/helpers/status";
import { getStatusConfig } from "@/constants/treatmentStatuses";
import { getCurrentPhaseConfig } from "@/constants/treatmentCurrentPhases";

const sessionsProgress = (completed, total) => {
  if (!total || total <= 0) return 0;
  const p = Math.round((Number(completed || 0) / Number(total)) * 100);
  return Math.max(0, Math.min(100, p));
};

export default function CardTreatment({ treatment, handleTreatmentModal }) {
  const isIndef = !!treatment?.is_indefinite;
  const total = isIndef ? null : treatment?.total_sessions ?? 0;
  const done = treatment?.completed_sessions ?? 0;
  const progress = !isIndef && total > 0 ? sessionsProgress(done, total) : null;

  const statusKey = (treatment?.status || "default")?.toLowerCase();
  const statusBg = statusColors[statusKey] || statusColors.default;

  const objectives = Array.isArray(treatment?.objectives)
    ? treatment.objectives
    : [];

  const phaseConfig = getCurrentPhaseConfig(treatment.current_phase);
  const statusConfig = getStatusConfig(treatment.status);

  return (
    <div
      key={treatment?.id}
      className="p-6 transition-shadow border-l-4 border-teal-500 bg-gradient-to-r from-teal-50 to-transparent rounded-r-xl hover:shadow-md"
    >
      {/* Encabezado */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <div
                className="flex items-center justify-center bg-teal-100 rounded-lg shadow-lg cursor-pointer w-14 h-14"
                onClick={() => handleTreatmentModal(treatment)}
              >
                <Edit className="w-6 h-6 text-teal-600 hover:text-teal-400" />
              </div>

              {/* TIPO DE SESIÓN */}
              {treatment?.session_type?.name && (
                <div className="flex items-center gap-3 p-2 border border-green-300 rounded-lg bg-teal-50 dark:bg-teal-900/20">
                  {/* Icono / Indicador Visual */}
                  <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-teal-200 rounded-full dark:bg-teal-600">
                    <Dumbbell className="w-5 h-5 text-teal-700 dark:text-white" />
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Tipo de Sesión
                    </span>
                    <span className="block text-base font-semibold text-teal-700 dark:text-teal-300">
                      {treatment.session_type.name}
                    </span>
                  </div>
                </div>
              )}

              {/* STATUS */}
              {treatment?.status && (
                <div
                  className={`flex items-center gap-3 p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 ${statusConfig.className}`}
                >
                  <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-teal-200 rounded-full dark:bg-teal-600">
                    <Tag className={`w-5 h-5`} />
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Estado del Tratamiento
                    </span>
                    <span
                      className={`block text-base font-semibold whitespace-nowrap`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              )}

              {/* FASE ACTUAL */}
              {treatment?.current_phase && (
                <div
                  className={`flex items-center gap-3 p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 ${phaseConfig.className}`}
                  title="Fase actual del plan de tratamiento"
                >
                  <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-teal-200 rounded-full dark:bg-teal-600">
                    {/* Puedes usar íconos condicionales aquí (ej: Stethoscope para 'evaluation', Dumbbell para 'restoration') */}
                    <Target className={`w-4 h-4`} />
                  </div>

                  {/* Contenedor principal con fondo suave (usando las clases de la fase) */}
                  <div>
                    {/* Ícono dentro de un círculo resaltado */}
                    {/* Usamos text-white para el icono si el fondo es claro */}
                    {/* Etiqueta / Label (Para indicar qué información es) */}
                    <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Fase Actual:
                    </span>

                    {/* Texto de la Fase */}
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {phaseConfig.label}
                    </span>
                  </div>
                </div>
              )}

              {/* INDEFINIDO (por cantidad de sesiones) */}
              {isIndef && (
                <div className="flex items-center gap-3 p-2 border border-green-300 rounded-lg bg-teal-50 dark:bg-teal-900/20">
                  {/* Icono / Indicador Visual */}
                  <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-teal-200 rounded-full dark:bg-teal-600">
                    <Timer className="w-5 h-5 text-teal-700 dark:text-white" />
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Duración
                    </span>
                    <span className="block text-base font-semibold text-teal-700 dark:text-teal-300">
                      Sin límite de sesiones
                    </span>
                  </div>
                </div>
              )}
            </div>

            <h3 className="mt-4 text-lg font-bold text-gray-900">
              {treatment?.name || "Tratamiento"}
            </h3>
            <p className="text-sm text-gray-600">
              Atendido por:
              <div className="flex gap-2 mt-2 text-base text-gray-600">
                <Stethoscope className="w-6 h-6" />
                {treatment?.doctor?.name || "-"}
              </div>
            </p>
          </div>
        </div>

        {/* Fechas (mostrar siempre fin, aunque sea indefinido en sesiones) */}
        <div className="text-right">
          <p className="text-sm text-gray-600">
            Inicio: {fmtDateISO(treatment?.start_date)}
          </p>
          <p className="text-sm text-gray-600">
            Fin: {fmtDateISO(treatment?.end_date)}
          </p>

          {/* Ejemplo adicional: dolor si existiera */}
          {treatment?.pain_reduction != null && (
            <div className="mt-2">
              <span className="text-xs text-gray-600">Dolor: </span>
              <span
                className={`font-bold ${
                  treatment?.pain_reduction >= 7
                    ? "text-red-600"
                    : treatment?.pain_reduction >= 4
                    ? "text-orange-600"
                    : "text-green-600"
                }`}
              >
                {treatment?.pain_reduction}/10
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bloques principales */}
      <div className="grid grid-cols-1 gap-4 my-4 md:grid-cols-2">
        <div>
          <p className="mb-1 text-sm font-semibold text-gray-700">
            Diagnóstico
          </p>
          <p className="text-sm text-gray-600 uppercase">
            {treatment?.diagnosis || "-"}
          </p>
        </div>

        <div>
          <p className="mb-1 text-sm font-semibold text-gray-700">
            Objetivos del tratamiento
          </p>
          <div className="flex flex-wrap gap-2">
            {objectives.length > 0 ? (
              objectives.map((o, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs text-blue-700 border border-blue-200 rounded-full bg-blue-50"
                >
                  {o}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">—</span>
            )}
          </div>
        </div>
      </div>

      {/* NUEVOS CAMPOS */}
      <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
        {/* FRECUENCIA */}
        <div className="p-3 bg-white border border-gray-100 rounded-lg">
          <p className="mb-1 text-xs font-semibold text-gray-600">Frecuencia</p>
          <p className="text-sm text-gray-800">
            {treatment?.frequency
              ? `${treatment.frequency} veces / ${treatment?.frequency_time} `
              : "-"}
          </p>
        </div>

        {/* MEJORA MOVILIDAD */}
        <div className="p-3 bg-white border border-gray-100 rounded-lg">
          <p className="mb-1 text-xs font-semibold text-gray-600">
            Mejora de movilidad
          </p>
          <p className="text-sm text-gray-800">
            {pct(treatment?.mobility_improvement) || "-"}
          </p>
        </div>

        {/* GANANCIA DE FUERZA */}
        <div className="p-3 bg-white border border-gray-100 rounded-lg">
          <p className="mb-1 text-xs font-semibold text-gray-600">
            Ganancia de fuerza
          </p>
          <p className="text-sm text-gray-800">
            {pct(treatment?.strength_gain) || "-"}
          </p>
        </div>
      </div>

      {/* PROGRESO DE SESIONES (solo si NO es indefinido) */}
      {!isIndef && (total > 0 || done > 0) && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">
              Progreso de sesiones
            </span>
            <span className="text-sm text-gray-600">
              {done}/{total} ({progress}%)
            </span>
          </div>
          <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
            <div
              className="h-full bg-teal-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* CONTADOR PARA PLANES INDEFINIDOS */}
      {isIndef && (
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-700">
            Sesiones realizadas: <span className="font-semibold">{done}</span>
          </span>
        </div>
      )}

      {/* OUTCOME / NOTAS */}
      {treatment?.outcome && (
        <div className="p-3 mb-3 bg-white rounded-lg">
          <p className="mb-1 text-sm font-semibold text-gray-700">
            Notas Clínicas
          </p>
          <p className="text-sm text-gray-600">{treatment?.outcome}</p>
        </div>
      )}

      {/* TOTAL SESIONES RECOMENDADAS (oculto si es indefinido) */}
      {!isIndef && treatment?.total_sessions > 0 && (
        <div className="inline-block px-3 py-1 text-sm font-medium text-teal-700 bg-teal-100 rounded-full">
          {treatment.total_sessions} sesiones recomendadas
        </div>
      )}
    </div>
  );
}
