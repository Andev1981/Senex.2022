// resources/js/pages/kine-mobile/pending-sessions.jsx
import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import KineLayout from "@/Layouts/KineLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { 
  ClipboardList, 
  ChevronRight, 
  Clock, 
  User, 
  Activity, 
  Calendar,
  AlertCircle,
  FileText,
  CheckCircle2
} from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function PendingSessions({ pendingSessions = [], recentSessions = [] }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [activeTab, setActiveTab] = useState("pending");
  
  const handleSessionClick = (session) => {
    router.visit(route('kine.sessions.form', session.id));
  };

  const sessionsToShow = activeTab === "pending" ? pendingSessions : recentSessions;

  const Content = (
    <div className={`min-h-screen ${isDesktop ? 'p-8' : 'pb-24'} bg-[#F8FAFC]`}>
        <Head title="Bitácora de Atenciones" />
        
        {/* Header Hero / Title */}
        <div className={`${isDesktop ? 'mb-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm' : 'bg-brand-primary pt-12 pb-8 rounded-b-[40px] shadow-lg shadow-brand-primary/20 px-6 mb-6'}`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl border ${isDesktop ? 'bg-brand-primary/10 border-brand-primary/20' : 'bg-white/20 backdrop-blur-md border-white/30'}`}>
                    <ClipboardList className={`w-6 h-6 ${isDesktop ? 'text-brand-primary' : 'text-white'}`} />
                </div>
                <div>
                    <h1 className={`text-2xl font-black leading-none uppercase tracking-tight ${isDesktop ? 'text-slate-900' : 'text-white'}`}>Bitácora</h1>
                    <p className={`${isDesktop ? 'text-slate-400' : 'text-white/60'} text-[10px] font-bold uppercase tracking-[0.2em] mt-1`}>Atenciones y Registro SOAP</p>
                </div>
            </div>
        </div>

        {/* Selector de Pestañas (Tabs) */}
        <div className={`flex p-1.5 bg-slate-100 border border-slate-200/40 rounded-2xl mb-6 ${isDesktop ? 'max-w-md' : 'mx-6'}`}>
            <button
                type="button"
                onClick={() => setActiveTab("pending")}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === "pending"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                }`}
            >
                <Clock className="w-3.5 h-3.5" />
                Por Cerrar
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                    activeTab === "pending" ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                    {pendingSessions.length}
                </span>
            </button>
            <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === "history"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                }`}
            >
                <FileText className="w-3.5 h-3.5" />
                Historial
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                    activeTab === "history" ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                    {recentSessions.length}
                </span>
            </button>
        </div>

        {/* Listado */}
        <div className={`${isDesktop ? '' : 'px-6'}`}>
            {sessionsToShow.length > 0 ? (
                <div className={`grid grid-cols-1 ${isDesktop ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-4`}>
                    {sessionsToShow.map((session) => (
                        <button
                            key={session.id}
                            onClick={() => handleSessionClick(session)}
                            className="w-full bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 active:scale-[0.98] active:bg-slate-50 transition-all text-left group hover:border-brand-primary/20 hover:shadow-md"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border shrink-0 transition-colors ${
                                activeTab === 'pending'
                                    ? 'bg-slate-50 border-slate-100 group-hover:bg-brand-primary/5 group-hover:border-brand-primary/20'
                                    : 'bg-emerald-50/50 border-emerald-100 group-hover:bg-emerald-100/30 group-hover:border-emerald-200'
                            }`}>
                                <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">{session.date_human.split(' ')[0]}</span>
                                <span className="text-sm font-black text-slate-900 leading-none">{session.time || 'S/H'}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {activeTab === 'pending' ? (
                                        <>
                                            <span className={`w-2 h-2 rounded-full ${session.status === 'in_progress' ? 'bg-purple-500 animate-pulse' : 'bg-blue-500'}`} />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                                                {session.session_type}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest truncate">
                                                {session.session_type}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <h3 className="text-sm font-black text-slate-900 truncate leading-tight mb-0.5 uppercase">
                                    {session.patient_name}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">
                                    {session.diagnosis || 'Sin diagnóstico'}
                                </p>
                            </div>

                            <div className={`w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-350 transition-all shadow-sm ${
                                activeTab === 'pending' 
                                    ? 'group-hover:bg-brand-primary group-hover:text-white' 
                                    : 'group-hover:bg-emerald-600 group-hover:text-white'
                            }`}>
                                <ChevronRight className="w-5 h-5" />
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center px-10 bg-white rounded-[3rem] border border-slate-100 border-dashed shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Activity className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 uppercase">
                        {activeTab === "pending" ? "Todo al día" : "Sin Historial"}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                        {activeTab === "pending" 
                            ? "No tienes atenciones pendientes de cierre por el momento."
                            : "Aún no has registrado atenciones en este período."}
                    </p>
                </div>
            )}
        </div>

        {/* Aviso de Ayuda */}
        {sessionsToShow.length > 0 && !isDesktop && (
            <div className="px-10 py-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                    <AlertCircle className="w-3 h-3 text-slate-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {activeTab === 'pending' ? 'Toca una atención para completar el SOAP' : 'Toca una atención para ver su detalle'}
                    </span>
                </div>
            </div>
        )}
    </div>
  );

  return isDesktop ? (
    <AuthenticatedLayout>{Content}</AuthenticatedLayout>
  ) : (
    <KineLayout>{Content}</KineLayout>
  );
}
