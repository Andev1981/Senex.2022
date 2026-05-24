// resources/js/pages/kine-mobile/pending-sessions.jsx
import React from "react";
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
  FileText
} from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function PendingSessions({ pendingSessions = [] }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
  const handleSessionClick = (session) => {
    router.visit(route('kine.sessions.form', session.id));
  };

  const Content = (
    <div className={`min-h-screen ${isDesktop ? 'p-8' : 'pb-24'} bg-[#F8FAFC]`}>
        <Head title="Atenciones Pendientes" />
        
        {/* Header Hero / Title */}
        <div className={`${isDesktop ? 'mb-10 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm' : 'bg-brand-primary pt-12 pb-8 rounded-b-[40px] shadow-lg shadow-brand-primary/20 px-6'}`}>
            <div className="flex items-center gap-4 mb-2">
                <div className={`p-3 rounded-2xl border ${isDesktop ? 'bg-brand-primary/10 border-brand-primary/20' : 'bg-white/20 backdrop-blur-md border-white/30'}`}>
                    <ClipboardList className={`w-6 h-6 ${isDesktop ? 'text-brand-primary' : 'text-white'}`} />
                </div>
                <div>
                    <h1 className={`text-2xl font-black leading-none uppercase tracking-tight ${isDesktop ? 'text-slate-900' : 'text-white'}`}>Atenciones</h1>
                    <p className={`${isDesktop ? 'text-slate-400' : 'text-white/60'} text-[10px] font-bold uppercase tracking-[0.2em] mt-1`}>Gestión de Cierre Clínico</p>
                </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isDesktop ? 'bg-slate-100 text-slate-600' : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white'}`}>
                    {pendingSessions.length} Pendientes de cierre
                </span>
            </div>
        </div>

        {/* Listado */}
        <div className={`${isDesktop ? '' : 'px-6 -mt-4'}`}>
            {pendingSessions.length > 0 ? (
                <div className={`grid grid-cols-1 ${isDesktop ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-4`}>
                    {pendingSessions.map((session) => (
                        <button
                            key={session.id}
                            onClick={() => handleSessionClick(session)}
                            className="w-full bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 active:scale-[0.98] active:bg-slate-50 transition-all text-left group hover:border-brand-primary/20 hover:shadow-md"
                        >
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 shrink-0 group-hover:bg-brand-primary/5 group-hover:border-brand-primary/20 transition-colors">
                                <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">{session.date_human.split(' ')[0]}</span>
                                <span className="text-sm font-black text-slate-900 leading-none">{session.time || 'S/H'}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`w-2 h-2 rounded-full ${session.status === 'in_progress' ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'}`} />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                                        {session.session_type}
                                    </span>
                                </div>
                                <h3 className="text-sm font-black text-slate-900 truncate leading-tight mb-0.5 uppercase">
                                    {session.patient_name}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">
                                    {session.diagnosis || 'Sin diagnóstico'}
                                </p>
                            </div>

                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                                <ChevronRight className="w-5 h-5" />
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center px-10 bg-white rounded-[3rem] border border-slate-100 border-dashed">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Activity className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 uppercase">Todo al día</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                        No tienes atenciones pendientes de cierre por el momento.
                    </p>
                </div>
            )}
        </div>

        {/* Aviso de Ayuda */}
        {pendingSessions.length > 0 && !isDesktop && (
            <div className="px-10 py-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                    <AlertCircle className="w-3 h-3 text-slate-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Toca una atención para completar el SOAP
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
