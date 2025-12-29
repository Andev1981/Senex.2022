import {
  Dumbbell,
  Edit,
  Stethoscope,
  Activity,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
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
      className={`p-8 bg-white border border-gray-100 shadow-xl rounded-[2.5rem] relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] border-l-8 ${
        statusKey === "in_progress"
          ? "border-l-brand-primary"
          : statusKey === "evaluation"
          ? "border-l-amber-400"
          : "border-l-gray-200"
      }`}
    >
      <div className="absolute top-0 right-0 w-48 h-48 -mt-24 -mr-24 rounded-full opacity-50 bg-gray-50 blur-3xl"></div>

      {/* Encabezado */}
      <div className="relative z-10 flex flex-col items-start justify-between gap-8 mb-8 xl:flex-row">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* STATUS BADGE */}
            <div
              className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border ${
                statusKey === "in_progress"
                  ? "bg-green-50 text-green-600 border-green-100"
                  : statusKey === "evaluation"
                  ? "bg-amber-50 text-amber-600 border-amber-100"
                  : "bg-gray-100 text-gray-500 border-gray-200"
              }`}
            >
              {statusConfig.label}
            </div>

            {/* FASE BADGE */}
            {treatment?.current_phase && (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-brand-secondary/10 border border-brand-secondary/20 rounded-xl">
                <Target className="w-3.5 h-3.5 text-brand-primary" />
                <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">
                  Fase: {phaseConfig.label}
                </span>
              </div>
            )}

            {/* INDEFINIDO */}
            {isIndef && (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-50 border border-purple-100 rounded-xl">
                <Timer className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest">
                  Sesiones Ilimitadas
                </span>
              </div>
            )}
          </div>

          <div className="flex items-start gap-6">
            <div
              className="flex items-center justify-center w-16 h-16 text-white transition-transform transform shadow-lg cursor-pointer bg-brand-primary rounded-2xl shadow-brand-primary/20 hover:scale-110 active:scale-95 shrink-0"
              onClick={() => handleTreatmentModal(treatment)}
            >
              <Edit className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <h3 className="mb-2 text-2xl font-black leading-none tracking-tight text-gray-900 uppercase truncate">
                {treatment?.name || "Protocolo de Rehabilitación"}
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 border border-gray-100 rounded-lg bg-gray-50">
                    <Stethoscope className="w-3.5 h-3.5 text-brand-primary" />
                  </div>
                  <span className="text-[10px] font-black text-brand-gray uppercase tracking-widest">
                    Dr. {treatment?.doctor?.name || "Por asignar"}
                  </span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 border border-gray-100 rounded-lg bg-gray-50">
                    <Dumbbell className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <span className="text-[10px] font-black text-brand-gray uppercase tracking-widest">
                    {treatment?.session_type?.name || "Atención General"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Metadata */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-right min-w-[180px]">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="enterprise-label !text-[8px] !mb-0">
                  Apertura
                </span>
                <span className="font-mono text-xs font-black text-gray-700">
                  {fmtDateISO(treatment?.start_date)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="enterprise-label !text-[8px] !mb-0">
                  Cierre Est.
                </span>
                <span className="font-mono text-xs font-black text-gray-400">
                  {fmtDateISO(treatment?.end_date) || "--/--/--"}
                </span>
              </div>
            </div>
          </div>

          {treatment?.pain_reduction != null && (
            <div className="flex items-center gap-3 px-4 py-2 border border-orange-100 bg-orange-50 rounded-xl">
              <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">
                Nivel de Dolor
              </span>
              <div className="flex items-center gap-1 font-mono font-black text-orange-700">
                {treatment.pain_reduction}
                <span className="text-[8px] opacity-40">/10</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid de Información Detallada */}
      <div className="relative z-10 grid grid-cols-1 gap-8 mb-8 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-7">
          <div className="p-6 border bg-slate-50/50 border-slate-100 rounded-3xl">
            <p className="enterprise-label !text-brand-primary mb-3">
              Diagnóstico Médico
            </p>
            <p className="text-sm font-bold leading-relaxed text-gray-700 uppercase">
              {treatment?.diagnostic ? (
                <span className="flex items-start gap-2">
                  <span className="px-2 py-0.5 bg-brand-primary text-white rounded font-mono text-xs">
                    {treatment.diagnostic.code}
                  </span>
                  {treatment.diagnostic.description}
                </span>
              ) : (
                "Sin diagnóstico codificado"
              )}
            </p>
            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="enterprise-label !text-[8px] mb-2">
                Descripción del Cuadro
              </p>
              <p className="text-xs italic font-medium leading-relaxed text-gray-500">
                {treatment.description ||
                  "No se ha ingresado descripción adicional."}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-5">
          <div className="p-6 bg-white border border-gray-100 shadow-inner rounded-3xl">
            <p className="enterprise-label !text-brand-primary mb-4">
              Metas Terapéuticas
            </p>
            <div className="flex flex-wrap gap-2">
              {objectives.length > 0 ? (
                objectives.map((o, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 text-[9px] font-black text-brand-primary uppercase tracking-widest border border-brand-secondary/30 rounded-xl bg-brand-secondary/5"
                  >
                    {o}
                  </span>
                ))
              ) : (
                <div className="flex items-center gap-2 text-xs italic text-gray-400">
                  <Activity className="w-4 h-4 opacity-30" />
                  Sin objetivos definidos
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de Evolución */}
      <div className="relative z-10 grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
        <div className="flex items-center justify-between p-5 transition-all bg-white border border-gray-100 rounded-2xl group hover:border-brand-primary/30">
          <div>
            <p className="enterprise-label !text-[8px] opacity-60 !mb-0">
              Frecuencia
            </p>
            <p className="text-sm font-black tracking-tight text-gray-900 uppercase">
              {treatment?.frequency
                ? `${treatment.frequency} Sesiones / ${treatment?.frequency_time}`
                : "-"}
            </p>
          </div>
          <div className="p-2 transition-all bg-gray-50 rounded-xl text-brand-gray group-hover:bg-brand-primary/10 group-hover:text-brand-primary">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center justify-between p-5 transition-all bg-white border border-gray-100 rounded-2xl group hover:border-green-300">
          <div>
            <p className="enterprise-label !text-[8px] text-green-600 !mb-0">
              Movilidad (ROM)
            </p>
            <p className="font-mono text-sm font-black tracking-tight text-green-700 uppercase">
              {pct(treatment?.mobility_improvement) || "Estable"}
            </p>
          </div>
          <div className="p-2 text-green-600 bg-green-50 rounded-xl">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center justify-between p-5 transition-all bg-white border border-gray-100 rounded-2xl group hover:border-brand-primary/30">
          <div>
            <p className="enterprise-label !text-[8px] text-brand-primary !mb-0">
              Ganancia Fuerza
            </p>
            <p className="font-mono text-sm font-black tracking-tight uppercase text-brand-primary">
              {pct(treatment?.strength_gain) || "Estable"}
            </p>
          </div>
          <div className="p-2 bg-brand-secondary/10 rounded-xl text-brand-primary">
            <Zap className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Footer: Progreso de Sesiones */}
      <div className="relative z-10 p-6 border border-gray-100 bg-gray-50 rounded-3xl">
        {!isIndef && (total > 0 || done > 0) ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 font-black bg-white border border-gray-200 shadow-sm rounded-xl text-brand-primary">
                  {done}
                </div>
                <div>
                  <p className="text-xs font-black tracking-tight text-gray-900 uppercase">
                    Registro de Avance
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Total sesiones: {total}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-black text-brand-primary">
                  {progress}%
                </p>
                <p className="text-[8px] font-black text-brand-gray uppercase tracking-[0.2em]">
                  Completado
                </p>
              </div>
            </div>
            <div className="h-3 w-full bg-white rounded-full overflow-hidden border border-gray-200 p-0.5 shadow-inner">
              <div
                className="h-full bg-brand-primary rounded-full shadow-[0_0_10px_rgba(50,146,179,0.2)] transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : isIndef ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 font-black text-purple-600 bg-white border border-gray-200 shadow-sm rounded-xl">
                {done}
              </div>
              <p className="text-xs font-black tracking-tight text-gray-900 uppercase">
                Sesiones Realizadas Históricas
              </p>
            </div>
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-lg border border-purple-100">
              Plan Abierto
            </span>
          </div>
        ) : null}
      </div>

      {treatment?.outcome && (
        <div className="p-6 mt-6 border border-blue-100 bg-blue-50/30 rounded-3xl">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-blue-600" />
            <p className="enterprise-label !text-blue-700 !mb-0">
              Resumen de la Evolución
            </p>
          </div>
          <p className="text-xs italic font-bold leading-relaxed text-blue-800">
            {treatment.outcome}
          </p>
        </div>
      )}
    </div>
  );
}
