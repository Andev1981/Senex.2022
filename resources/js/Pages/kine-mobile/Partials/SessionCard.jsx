// resources/js/pages/kine-mobile/Partials/SessionCard.jsx
import React from "react";
import {
  Clock,
  User,
  Phone,
  FileText,
  CheckCircle2,
  XCircle,
  Calendar,
  ChevronRight,
  Edit3,
  Activity,
} from "lucide-react";
import { router } from "@inertiajs/react";

const statusConfig = {
  scheduled: {
    bg: "bg-white",
    border: "border-slate-100",
    icon: Clock,
    iconBg: "bg-slate-50",
    iconColor: "text-slate-400",
    badge: "bg-blue-50 text-blue-600",
    label: "Programada",
    actionLabel: "Atender",
    actionBg: "bg-brand-primary",
  },
  checked_in: {
    bg: "bg-emerald-50/30",
    border: "border-emerald-100",
    icon: User,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
    label: "Llegó",
    actionLabel: "Iniciar Ahora",
    actionBg: "bg-emerald-600",
  },
  in_progress: {
    bg: "bg-amber-50/50",
    border: "border-amber-200",
    icon: Activity,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    badge: "bg-amber-100 text-amber-700",
    label: "En Curso",
    actionLabel: "Continuar",
    actionBg: "bg-amber-600",
  },
  completed: {
    bg: "bg-slate-50/50",
    border: "border-slate-100",
    icon: CheckCircle2,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-400",
    badge: "bg-slate-200 text-slate-600",
    label: "Finalizada",
    actionLabel: null,
  },
  cancelled: {
    bg: "bg-red-50/30",
    border: "border-red-100",
    icon: XCircle,
    iconBg: "bg-red-50",
    iconColor: "text-red-400",
    badge: "bg-red-100 text-red-600",
    label: "Anulada",
    actionLabel: null,
  },
};

export default function SessionCard({
  session,
  onComplete,
  onCancel,
  showDate = true,
}) {
  const status = session.status?.toLowerCase();
  const config = statusConfig[status] || statusConfig["scheduled"];
  const StatusIcon = config.icon;

  const handleCallPatient = (e) => {
    e.stopPropagation();
    if (session.patient_phone) {
      window.location.href = `tel:${session.patient_phone}`;
    }
  };

  const handleViewDetail = () => {
    if (status === 'in_progress' || status === 'checked_in') {
        router.visit(route("kine.sessions.form", session.id));
        return;
    }
    router.visit(route("kine.sessions.show", session.id));
  };

  return (
    <div
      className={`p-6 ${config.bg} border-2 ${config.border} rounded-[2rem] shadow-sm active:scale-[0.98] transition-all cursor-pointer group hover:shadow-xl hover:shadow-slate-200/50`}
      onClick={handleViewDetail}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${config.iconBg} rounded-2xl flex items-center justify-center ${config.iconColor} transition-colors shadow-inner`}>
                <StatusIcon className="w-6 h-6" />
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <h4 className="font-black text-slate-900 leading-tight tracking-tight text-base">{session.patient_name}</h4>
                    {session.has_active_treatments && (
                        <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" title="Tratamiento activo" />
                    )}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {session.session_type}
                </p>
            </div>
        </div>
        <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-sm ${config.badge}`}>
            {config.label}
        </span>
      </div>

      {session.diagnosis && session.diagnosis !== "Sin diagnóstico" && session.diagnosis !== "Agenda Programada" && (
          <div className="mb-6 p-4 bg-white/60 rounded-2xl border border-slate-100 shadow-inner">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Diagnóstico</p>
              <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{session.diagnosis}"</p>
          </div>
      )}

      <div className="flex items-center justify-between pt-5 border-t border-slate-100/50">
          <div className="flex items-center gap-6">
              <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Horario</span>
                  <div className="flex items-center gap-1.5 text-slate-700">
                      <Clock className="w-3 h-3 opacity-40" />
                      <span className="text-xs font-black tracking-tight">{session.time}</span>
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-3">
                {session.patient_phone && (
                    <button
                    onClick={handleCallPatient}
                    className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 text-teal-600 rounded-2xl active:scale-90 transition-all hover:shadow-lg shadow-sm"
                    >
                        <Phone className="w-5 h-5" />
                    </button>
                )}
                
                {config.actionLabel && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onComplete && onComplete(session);
                        }}
                        className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-white shadow-xl active:scale-95 transition-all ${config.actionBg} shadow-${config.actionBg.split('-')[1]}-500/20`}
                    >
                        {config.actionLabel}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}

                {!config.actionLabel && (
                    <div className="w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-400 rounded-2xl">
                        <ChevronRight className="w-5 h-5" />
                    </div>
                )}
          </div>
      </div>
    </div>
  );
}
