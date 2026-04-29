// resources/js/pages/kine-mobile/session-detail.jsx
import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Clock,
  FileText,
  DollarSign,
  Activity,
  CheckCircle2,
  XCircle,
  Edit3,
  Save,
  Stethoscope,
  ChevronLeft,
} from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";

export default function SessionDetail({ session }) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(session.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  const statusConfig = {
    scheduled: {
      color: "bg-blue-50 text-blue-600",
      icon: Clock,
      label: "Programada",
    },
    completed: {
      color: "bg-green-50 text-green-600",
      icon: CheckCircle2,
      label: "Completada",
    },
    cancelled: {
      color: "bg-red-50 text-red-600",
      icon: XCircle,
      label: "Cancelada",
    },
  };

  const config = statusConfig[session.status] || statusConfig["scheduled"];
  const StatusIcon = config.icon;

  const handleBack = () => {
    router.visit(route("kine.my-sessions"));
  };

  const handleCallPatient = () => {
    if (session.patient.phone) {
      window.location.href = `tel:${session.patient.phone}`;
    }
  };

  const handleCompleteSession = () => {
    router.visit(route('kine.sessions.form', session.id));
  };

  const handleCancelSession = () => {
    const reason = prompt("Motivo de cancelación:");
    if (!reason) return;

    router.post(
      route("kine.sessions.cancel", session.id),
      {
        cancellation_reason: reason,
      },
      {
        onSuccess: () => {
          router.visit(route("kine.my-sessions"));
        },
      }
    );
  };

  const handleSaveNotes = () => {
    setIsSaving(true);

    router.put(
      route("kine.sessions.update-notes", session.id),
      {
        notes: notes,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setIsSaving(false);
          setIsEditingNotes(false);
        },
        onError: () => {
          setIsSaving(false);
          alert("Error al guardar las notas");
        },
      }
    );
  };

  return (
    <KineLayout>
      <Head title={`Sesión - ${session.patient.name}`} />

      <div className="min-h-screen pb-24 bg-[#FDFDFD]">
        
        {/* Detail Header */}
        <div className="px-6 py-6 flex items-center gap-4">
            <button
                onClick={handleBack}
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-2xl shadow-sm active:scale-90 transition-all"
            >
                <ChevronLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Detalle de Sesión</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {session.date}
                </p>
            </div>
        </div>

        <div className="px-6 space-y-6">
          
          {/* Status Badge Big */}
          <div className={`p-4 rounded-[32px] border border-slate-50 flex items-center justify-between ${config.color}`}>
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/50 rounded-2xl flex items-center justify-center">
                    <StatusIcon className="w-5 h-5" />
                  </div>
                  <span className="font-black uppercase text-[10px] tracking-widest">{config.label}</span>
              </div>
              <span className="text-xs font-bold opacity-60">{session.time}</span>
          </div>

          {/* Paciente Card */}
          <div className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-primary/10 rounded-[22px] flex items-center justify-center text-brand-primary font-black text-xl shadow-inner">
                    {session.patient.name[0]}
                </div>
                <div>
                  <h2 className="font-black text-slate-900 tracking-tight leading-none">{session.patient.name}</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{session.patient.rut}</p>
                </div>
              </div>
              {session.patient.phone && (
                <button
                  onClick={handleCallPatient}
                  className="w-12 h-12 flex items-center justify-center bg-teal-50 text-teal-600 rounded-2xl active:scale-90 transition-all shadow-sm"
                >
                  <Phone className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-4">
                    <Stethoscope className="w-5 h-5 text-slate-300" />
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Servicio</p>
                        <p className="text-sm font-bold text-slate-700">{session.session_type.name}</p>
                    </div>
                </div>
                {session.treatment.diagnosis && (
                    <div className="flex items-center gap-4">
                        <Activity className="w-5 h-5 text-slate-300" />
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Diagnóstico</p>
                            <p className="text-sm font-bold text-slate-700">{session.treatment.diagnosis}</p>
                        </div>
                    </div>
                )}
            </div>
          </div>

          {/* Notas de la sesión */}
          <div className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notas de Evolución</h3>
              {session.status === "scheduled" && !isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="p-2 text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Escribe la evolución aquí..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-brand-primary/5 focus:bg-white transition-all"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSaving}
                    className="flex-1 py-3 bg-brand-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-brand-primary/20"
                  >
                    {isSaving ? "Guardando..." : "Guardar Notas"}
                  </button>
                  <button
                    onClick={() => { setIsEditingNotes(false); setNotes(session.notes || ""); }}
                    className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                  >
                    X
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-2xl">
                {notes ? (
                  <p className="text-sm font-bold text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {notes}
                  </p>
                ) : (
                  <p className="text-xs font-bold text-slate-400 italic">
                    Sin notas registradas aún
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Información de ganancias */}
          {session.status === "completed" && session.payment.doctor_amount_clp && (
            <div className="bg-slate-900 p-6 rounded-[32px] shadow-xl">
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Tu Comisión por Sesión</p>
                 <h2 className="text-white text-3xl font-black tracking-tighter">
                     ${session.payment.doctor_amount_clp.toLocaleString('es-CL')}
                 </h2>
            </div>
          )}

          {/* Acciones */}
          {session.status === "scheduled" && (
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleCompleteSession}
                className="flex items-center justify-center gap-3 py-5 bg-brand-primary text-white rounded-[32px] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-brand-primary/20 active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                Atender Ahora
              </button>

              <button
                onClick={handleCancelSession}
                className="py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest"
              >
                Anular Cita
              </button>
            </div>
          )}
        </div>
      </div>
    </KineLayout>
  );
}
