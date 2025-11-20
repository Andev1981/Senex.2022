import { Clipboard, Edit } from "lucide-react";
import React from "react";

const statusColors = {
  active: "bg-emerald-600",
  paused: "bg-amber-600",
  completed: "bg-slate-600",
  canceled: "bg-rose-600",
  // fallback
  default: "bg-gray-600",
};

const pct = (n) =>
  typeof n === "number" && !isNaN(n) ? `${n}%` : n ? `${Number(n)}%` : null;

const fmtDate = (d) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("es-CL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const sessionsProgress = (completed, total) => {
  if (!total || total <= 0) return 0;
  const p = Math.round((Number(completed || 0) / Number(total)) * 100);
  return Math.max(0, Math.min(100, p));
};

export default function TreatmentCard({ treatment, handleTreatmentModal }) {
  const isIndef = !!treatment?.is_indefinite;
  const total = isIndef ? null : treatment?.total_sessions ?? 0;
  const done = treatment?.completed_sessions ?? 0;
  const progress = !isIndef && total > 0 ? sessionsProgress(done, total) : null;

  const statusKey = (treatment?.status || "default")?.toLowerCase();
  const statusBg = statusColors[statusKey] || statusColors.default;

  const objectives = Array.isArray(treatment?.objectives)
    ? treatment.objectives
    : [];

  return (
    <div
      key={treatment?.id}
      className="p-6 transition-shadow border-l-4 border-teal-500 bg-gradient-to-r from-teal-50 to-transparent rounded-r-xl hover:shadow-md"
    >
      {/* Encabezado */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg cursor-pointer"
            onClick={() => handleTreatmentModal(treatment)}
          >
            <Edit className="w-6 h-6 text-teal-600 hover:text-teal-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {treatment?.session_type?.name && (
                <span className="inline-block px-3 py-1 text-xs text-white bg-teal-600 rounded-full">
                  {treatment.session_type.name}
                </span>
              )}

              {/* STATUS */}
              {treatment?.status && (
                <span
                  className={`inline-block px-3 py-1 text-xs text-white rounded-full ${statusBg}`}
                  title="Estado del plan de tratamiento"
                >
                  {String(treatment.status).toUpperCase()}
                </span>
              )}

              {/* FASE ACTUAL */}
              {/* {treatment?.current_phase && (
                <span className="inline-block px-3 py-1 text-xs text-indigo-700 bg-indigo-100 border border-indigo-200 rounded-full">
                  Fase: {treatment.current_phase}
                </span>
              )} */}

              {/* INDEFINIDO (por cantidad de sesiones) */}
              {isIndef && (
                <span className="inline-block px-3 py-1 text-xs border rounded-full text-amber-700 bg-amber-100 border-amber-200">
                  Sin límite de sesiones
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-gray-900">
              {treatment?.name || "Tratamiento"}
            </h3>
            <p className="text-sm text-gray-600">
              Atendido por: {treatment?.doctor?.name || "-"}
            </p>
          </div>
        </div>

        {/* Fechas (mostrar siempre fin, aunque sea indefinido en sesiones) */}
        <div className="text-right">
          <p className="text-sm text-gray-600">
            Inicio: {fmtDate(treatment?.start_date)}
          </p>
          <p className="text-sm text-gray-600">
            Fin: {fmtDate(treatment?.end_date)}
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
      <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
        <div>
          <p className="mb-1 text-sm font-semibold text-gray-700">Evaluación</p>
          <p className="text-sm text-gray-600">{treatment?.diagnosis || "-"}</p>
        </div>

        <div>
          <p className="mb-1 text-sm font-semibold text-gray-700">
            Tratamiento (Objetivos)
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
