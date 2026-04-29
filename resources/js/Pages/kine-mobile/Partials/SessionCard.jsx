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
} from "lucide-react";
import { router } from "@inertiajs/react";

const statusConfig = {
  scheduled: {
    color: "bg-white",
    icon: Clock,
    badgeColor: "bg-blue-50 text-blue-600",
    label: "Programada",
  },
  completed: {
    color: "bg-white",
    icon: CheckCircle2,
    badgeColor: "bg-green-50 text-green-600",
    label: "Completada",
  },
  cancelled: {
    color: "bg-white",
    icon: XCircle,
    badgeColor: "bg-red-50 text-red-600",
    label: "Cancelada",
  },
};

export default function SessionCard({
  session,
  onComplete,
  onCancel,
  showDate = true,
}) {
  const status = session.status?.toLowerCase() || "scheduled";
  const config = statusConfig[status] || statusConfig["scheduled"];
  const StatusIcon = config.icon;

  const handleCallPatient = (e) => {
    e.stopPropagation();
    if (session.patient_phone) {
      window.location.href = `tel:${session.patient_phone}`;
    }
  };

  const handleViewDetail = () => {
    router.visit(route("kine.sessions.show", session.id));
  };

  return (
    <div
      className="p-5 bg-white border border-slate-100 rounded-[32px] shadow-sm active:scale-[0.98] transition-all cursor-pointer group"
      onClick={handleViewDetail}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                <User className="w-5 h-5" />
            </div>
            <div>
                <h4 className="font-black text-slate-900 leading-none tracking-tight">{session.patient_name}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                    {session.session_type}
                </p>
            </div>
        </div>
        <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-full ${config.badgeColor}`}>
            {config.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-xl">
              <Calendar className="w-3 h-3 text-brand-primary" />
              <span className="text-[11px] font-bold text-slate-600">{session.date}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-xl">
              <Clock className="w-3 h-3 text-brand-primary" />
              <span className="text-[11px] font-bold text-slate-600">{session.time}</span>
          </div>
      </div>

      {session.diagnosis && session.diagnosis !== "Sin diagnóstico" && (
          <div className="mb-4 px-3 py-2 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
              <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-0.5">Diagnóstico</p>
              <p className="text-xs font-bold text-slate-700 truncate">{session.diagnosis}</p>
          </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div>
              {session.earnings ? (
                  <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mi Comisión</span>
                      <span className="text-sm font-black text-slate-900 tracking-tight">
                          ${session.earnings.toLocaleString('es-CL')}
                      </span>
                  </div>
              ) : (
                  <span className="text-[10px] font-bold text-slate-300 italic">Ver detalles</span>
              )}
          </div>
          <div className="flex items-center gap-2">
                {session.patient_phone && (
                    <button
                    onClick={handleCallPatient}
                    className="w-10 h-10 flex items-center justify-center bg-teal-50 text-teal-600 rounded-2xl active:scale-90 transition-all hover:bg-teal-100 shadow-sm shadow-teal-100"
                    >
                        <Phone className="w-4 h-4" />
                    </button>
                )}
                <div className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                    <ChevronRight className="w-4 h-4" />
                </div>
          </div>
      </div>
    </div>
  );
}
