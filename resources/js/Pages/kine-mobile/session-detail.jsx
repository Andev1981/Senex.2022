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
  Activity,
  CheckCircle2,
  XCircle,
  Edit3,
  Stethoscope,
  ChevronLeft,
  Target,
  Zap,
  TrendingUp,
  History,
  Info,
  MoveUp,
  MoveDiagonal,
  RotateCcw,
  MapPin,
  ShieldCheck
} from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import PainMapCard from "@/components/Body/PainMapCard";

const ROMDisplay = ({ label, before, after, icon: Icon, colorClass = "text-amber-500", bgClass = "bg-amber-50" }) => {
    return (
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <div className={`p-1.5 ${bgClass} rounded-lg`}>
                    <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-[8px] font-black text-slate-300 uppercase mb-0.5">Inicial</p>
                    <p className="text-sm font-black text-slate-700">{before || 0}°</p>
                </div>
                <div className="h-8 w-px bg-slate-100 mx-2" />
                <div className="text-right">
                    <p className="text-[8px] font-black text-slate-300 uppercase mb-0.5">Final</p>
                    <p className={`text-sm font-black ${after > before ? 'text-emerald-500' : 'text-slate-700'}`}>{after || 0}°</p>
                </div>
            </div>
            {(after !== undefined && before !== undefined) && (
                <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden mt-1">
                    <div className={`h-full bg-slate-200`} style={{ width: `${(before / 180) * 100}%` }} />
                    <div className={`h-full ${after > before ? 'bg-emerald-400' : 'bg-slate-400'} mt-[-4px]`} style={{ width: `${(after / 180) * 100}%` }} />
                </div>
            )}
        </div>
    );
};

export default function SessionDetail({ session, permissions = {} }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const canCreate = permissions.can_create_sessions !== false;

  // Parseo de notas SOAP
  const soapData = {
    subjective: session.subjective || session.notes?.split('---OBJETIVO---')[0]?.replace('---SUBJETIVO---', '').trim() || "",
    objective: session.objective || session.notes?.split('---OBJETIVO---')[1]?.split('---EVALUACION---')[0]?.trim() || "",
    assessment: session.assessment || session.notes?.split('---EVALUACION---')[1]?.split('---PLAN---')[0]?.trim() || "",
    plan: session.plan || session.notes?.split('---PLAN---')[1]?.trim() || session.notes || ""
  };

  const isSoapFormat = !!(session.subjective || session.objective || session.assessment || session.plan || session.notes?.includes('---SUBJETIVO---'));

  const statusConfig = {
    scheduled: { color: "bg-blue-50 text-blue-600 border-blue-100", icon: Clock, label: "Programada" },
    checked_in: { color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: User, label: "Llegó a Clínica" },
    in_progress: { color: "bg-amber-50 text-amber-600 border-amber-100", icon: Activity, label: "Atención en Curso" },
    completed: { color: "bg-green-50 text-green-600 border-green-100", icon: CheckCircle2, label: "Finalizada" },
    cancelled: { color: "bg-red-50 text-red-600 border-red-100", icon: XCircle, label: "Anulada" },
    no_show: { color: "bg-slate-100 text-slate-500 border-slate-200", icon: XCircle, label: "Inasistencia" }
  };

  const config = statusConfig[session.status] || statusConfig["scheduled"];
  const StatusIcon = config.icon;

  const painDiff = (session.pain_before || 0) - (session.pain_after || 0);

  const Content = (
    <div className={`min-h-screen ${isDesktop ? 'p-12' : 'pb-24'} bg-slate-50/50`}>
        <Head title={`Atención - ${session.patient.name}`} />
        
        {/* Detail Header */}
        <div className={`max-w-7xl mx-auto ${isDesktop ? 'mb-10 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm' : 'bg-white px-6 pt-12 pb-8 rounded-b-[3rem] shadow-sm border-b border-slate-100'}`}>
            <div className="flex items-center gap-6">
                <button onClick={() => window.history.back()} className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-2xl active:scale-90 transition-all border border-slate-100"><ChevronLeft className="w-6 h-6 text-slate-400" /></button>
                <div className="flex-1">
                    <h1 className={`${isDesktop ? 'text-3xl' : 'text-xl'} font-black text-slate-900 tracking-tight uppercase`}>Detalle de Atención</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-brand-primary" /> {session.date} • {session.time}
                    </p>
                </div>
                {isDesktop && (
                    <div className={`px-8 py-4 rounded-[2rem] border-2 flex items-center gap-4 ${config.color} shadow-sm`}>
                        <StatusIcon className="w-6 h-6" />
                        <span className="font-black uppercase text-xs tracking-widest">{config.label}</span>
                    </div>
                )}
            </div>
        </div>

        <div className={`max-w-7xl mx-auto lg:grid lg:grid-cols-12 lg:gap-10 ${isDesktop ? '' : 'px-6 space-y-8 mt-8'}`}>
          
          {/* Columna Izquierda: Paciente & Mapa */}
          <div className="lg:col-span-4 space-y-8">
              <div className="p-8 bg-white border border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/40 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-8">
                        <div className="w-20 h-20 bg-brand-primary text-white rounded-[2rem] flex items-center justify-center font-black text-3xl shadow-2xl border-4 border-white">{session.patient.name[0]}</div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase truncate">{session.patient.name}</h2>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] mt-2 bg-slate-50 inline-block px-3 py-1 rounded-lg border border-slate-100">{session.patient.rut}</p>
                        </div>
                    </div>
                    <div className="space-y-4 pt-6 border-t border-slate-50">
                        <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Diagnóstico</p><p className="text-sm font-black text-slate-700 leading-snug">{session.treatment?.diagnosis || 'Sesión Directa'}</p></div>
                        <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Servicio</p><p className="text-sm font-black text-brand-primary uppercase tracking-tight">{session.session_type?.name || 'Kinesiología'}</p></div>
                    </div>
                </div>
              </div>

              {/* Mapa Corporal (Solo lectura) */}
              <PainMapCard
                  points={session.session_pain_map || []}
                  painBefore={session.pain_before}
                  painAfter={session.pain_after}
                  bodyPart={session.body_part} 
                  laterality={session.laterality} 
                  isLocked={true} 
                  title="Localización Registrada"
              />

              {session.informed_consent_confirmed && (
                  <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm"><ShieldCheck className="w-6 h-6" /></div>
                      <div>
                          <p className="text-xs font-black uppercase text-emerald-900 tracking-widest">Consentimiento</p>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase">Validado Legalmente</p>
                      </div>
                  </div>
              )}
          </div>

          {/* Columna Derecha: Evolución Clínica */}
          <div className="lg:col-span-8 space-y-8">
              {/* Rangos de Movimiento (ROM) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ROMDisplay label="Flexión" before={session.rom_flexion_before} after={session.rom_flexion_after} icon={MoveUp} />
                  <ROMDisplay label="Abducción" before={session.rom_abduction_before} after={session.rom_abduction_after} icon={MoveDiagonal} />
                  <ROMDisplay label="Rotación" before={session.rom_rotation_before} after={session.rom_rotation_after} icon={RotateCcw} />
              </div>

              {/* SOAP Details */}
              <div className="p-10 bg-white border border-slate-100 rounded-[3.5rem] shadow-sm">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Registro SOAP</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Evolución estructurada de la sesión</p>
                    </div>
                    {['scheduled', 'in_progress', 'checked_in'].includes(session.status) && canCreate && (
                        <button onClick={() => router.visit(route('kine.sessions.form', session.id))} className="flex items-center gap-3 px-6 py-3 bg-brand-primary text-white rounded-2xl shadow-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all">
                            <Edit3 className="w-4 h-4" /> Editar Ficha
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3"><div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center font-black text-xs">S</div><p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em]">Subjetivo</p></div>
                        <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 min-h-[100px]"><p className="text-sm font-bold text-slate-600 italic">"{soapData.subjective || '---'}"</p></div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3"><div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center font-black text-xs">O</div><p className="text-[11px] font-black text-amber-500 uppercase tracking-[0.2em]">Objetivo</p></div>
                        <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 min-h-[100px]"><p className="text-sm font-bold text-slate-600 italic">"{soapData.objective || '---'}"</p></div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3"><div className="w-8 h-8 bg-red-50 text-red-500 rounded-xl flex items-center justify-center font-black text-xs">A</div><p className="text-[11px] font-black text-red-500 uppercase tracking-[0.2em]">Apreciación</p></div>
                        <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 min-h-[100px]"><p className="text-sm font-bold text-slate-600 italic">"{soapData.assessment || '---'}"</p></div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3"><div className="w-8 h-8 bg-teal-50 text-teal-500 rounded-xl flex items-center justify-center font-black text-xs">P</div><p className="text-[11px] font-black text-teal-500 uppercase tracking-[0.2em]">Plan</p></div>
                        <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 min-h-[100px]"><p className="text-sm font-bold text-slate-600 italic">"{soapData.plan || '---'}"</p></div>
                    </div>
                </div>
              </div>

              {/* EVA Visual */}
              {session.pain_before !== undefined && (
                  <div className="p-10 bg-slate-900 text-white rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                      <TrendingUp className="absolute top-0 right-0 w-64 h-64 opacity-5 -mr-16 -mt-16" />
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-2"><Activity className="w-4 h-4 text-brand-primary" /> Evolución del Dolor (EVA)</h3>
                      <div className="flex items-center justify-around gap-12">
                          <div className="text-center"><p className="text-[10px] font-black text-slate-500 uppercase mb-4">Inicial</p><div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-5xl font-black shadow-inner border border-slate-700">{session.pain_before}</div></div>
                          <div className="flex-1 flex flex-col items-center">
                              <div className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl border ${painDiff > 0 ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-700 border-slate-600'}`}>{painDiff > 0 ? `Baja de ${painDiff} puntos` : 'Sin variación'}</div>
                              <div className="w-full h-2 bg-slate-800 rounded-full mt-10 overflow-hidden"><div className="h-full bg-brand-primary transition-all duration-1000" style={{ width: `${(session.pain_after / 10) * 100}%` }} /></div>
                          </div>
                          <div className="text-center"><p className="text-[10px] font-black text-slate-500 uppercase mb-4">Final</p><div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-5xl font-black shadow-2xl">{session.pain_after}</div></div>
                      </div>
                  </div>
              )}
          </div>
        </div>
    </div>
  );

  return isDesktop ? (
    <AuthenticatedLayout>{Content}</AuthenticatedLayout>
  ) : (
    <KineLayout>{Content}</KineLayout>
  );
}
