import React from "react";
import {
  Activity,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Link } from "@inertiajs/react";

// Helper simple para formatear moneda
const fmtCLP = (value) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function PatientDashboard({ patient, openSessionModal }) {
  // 1. Cálculos de Contexto
  const totalDebt = patient.due_amount || 0;
  const activeTreatments = patient.active_treatments || [];
  const sessionsCount = patient.sessions_count || 0;

  // 🎯 Prioridad: Último tratamiento (Evaluación o En Curso)
  const mainTreatment = activeTreatments[0] || null;

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      {/* 1. TARJETAS DE ESTADO (KPIs Compactos) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Estado Financiero */}
        <div
          className={`p-6 rounded-[1.5rem] border transition-all duration-300 hover:scale-[1.02] shadow-sm ${
            totalDebt > 0
              ? "bg-red-50 border-red-100"
              : "bg-green-50 border-green-100"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-xl shadow-md ${
              totalDebt > 0 ? "bg-red-500 text-white shadow-red-200" : "bg-green-500 text-white shadow-green-200"
            }`}>
              {totalDebt > 0 ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${totalDebt > 0 ? "text-red-600" : "text-green-600"}`}>
                Finanzas
            </span>
          </div>
          <p className="enterprise-label !text-[8px] opacity-60">Saldo Pendiente</p>
          <p className={`text-2xl font-black tracking-tighter leading-none ${totalDebt > 0 ? "text-red-700" : "text-gray-900"}`}>
            {totalDebt > 0 ? fmtCLP(totalDebt) : "Al día"}
          </p>
        </div>

        {/* Resumen de Asistencia */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-[1.5rem] hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-brand-primary text-white rounded-xl shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-gray opacity-60">
                Asistencia
            </span>
          </div>
          <p className="enterprise-label !text-[8px] opacity-60">Sesiones Totales</p>
          <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none">
            {sessionsCount}
          </p>
        </div>

        {/* Sesiones Tratamiento Actual (Color Secundario) */}
        <div className="p-6 bg-brand-secondary text-white shadow-lg rounded-[1.5rem] hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-12 -mt-12 blur-xl"></div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="p-2 bg-white/20 text-white rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/80">Sesiones Plan</span>
          </div>
          <p className="text-[8px] font-black uppercase tracking-widest text-white/60 mb-1">Tratamiento Actual</p>
          <div className="text-2xl font-black tracking-tighter leading-none flex items-baseline gap-2">
            {mainTreatment ? (
                <>
                    {mainTreatment.sessions_count || 0}
                    <span className="text-sm opacity-40">/</span>
                    <span className="text-sm opacity-60">{mainTreatment.expected_sessions || 10}</span>
                </>
            ) : (
                <span className="text-lg uppercase tracking-tight">Sin Registro</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN TRATAMIENTO PRINCIPAL */}
      <div className="bg-white border border-gray-50 rounded-[2rem] p-8 shadow-xl shadow-gray-500/5 border-t-4 border-t-brand-primary">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                    mainTreatment?.status === 'evaluation' 
                    ? 'bg-amber-50 text-amber-600 border-amber-200' 
                    : 'bg-brand-secondary/10 text-brand-primary border-brand-secondary/20'
                }`}>
                    {mainTreatment?.status === 'evaluation' ? 'Fase de Evaluación' : 'Tratamiento Vigente'}
                </span>
                {mainTreatment && (
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${mainTreatment.status === 'evaluation' ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${mainTreatment.status === 'evaluation' ? 'text-amber-600' : 'text-green-600'}`}>
                            {mainTreatment.status === 'evaluation' ? 'Pendiente Inicio' : 'En Curso'}
                        </span>
                    </div>
                )}
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight uppercase">
                {mainTreatment?.diagnostic?.description || "Inicie una nueva evaluación clínica"}
            </h2>
            <p className="text-xs font-bold text-brand-gray uppercase tracking-tight mt-1 opacity-60">
                Especialista: {mainTreatment?.doctor?.name || "Por asignar"} {mainTreatment?.doctor?.last_name || ""} • Inicio: {mainTreatment?.start_date || 'Pendiente'}
            </p>
          </div>
          
          <div className="flex gap-2 shrink-0">
            {mainTreatment?.status === 'evaluation' && (
                <button 
                    onClick={() => openSessionModal()}
                    className="px-6 py-3 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Plus className="w-3.5 h-3.5" /> Iniciar Plan
                </button>
            )}
            <button className="px-6 py-3 bg-brand-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-brand-primary/20 transition-all active:scale-95">
                Ver Detalles
            </button>
          </div>
        </div>

        {mainTreatment ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                {/* Barra de Progreso */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="enterprise-label !text-[8px] !mb-0">
                            {mainTreatment.status === 'evaluation' ? 'Estado de Sesiones' : 'Cumplimiento del Plan'}
                        </span>
                        <span className="font-black text-sm text-gray-900 font-mono">
                            {mainTreatment.sessions_count || 0} <span className="text-gray-300 mx-1">/</span> {mainTreatment.expected_sessions || 10}
                        </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                            className={`h-full shadow-[0_0_10px_rgba(50,146,179,0.3)] transition-all duration-1000 ease-out ${
                                mainTreatment.status === 'evaluation' ? 'bg-amber-400' : 'bg-brand-primary'
                            }`}
                            style={{ width: `${Math.max(5, Math.min(((mainTreatment.sessions_count || 0) / (mainTreatment.expected_sessions || 10)) * 100, 100))}%` }}
                        ></div>
                    </div>
                </div>

                {/* Quick Session Button */}
                <div 
                    onClick={() => openSessionModal()}
                    className={`p-4 rounded-2xl border flex items-center justify-between group cursor-pointer transition-all ${
                    mainTreatment.status === 'evaluation' 
                    ? 'bg-amber-50 border-amber-100 hover:bg-amber-100' 
                    : 'bg-brand-secondary/5 border-brand-secondary/10 hover:bg-brand-secondary/10'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl shadow-sm group-hover:scale-110 transition-transform ${
                            mainTreatment.status === 'evaluation' ? 'bg-white text-amber-600' : 'bg-white text-brand-primary'
                        }`}>
                            <Plus className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-900 uppercase tracking-tight">
                                {mainTreatment.status === 'evaluation' ? 'Primera Sesión' : 'Nueva Sesión'}
                            </p>
                            <p className="text-[9px] font-bold text-brand-gray uppercase tracking-widest opacity-60">Registrar atención hoy</p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-gray opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
            </div>
        ) : (
            <div className="py-16 text-center bg-gray-50/50 rounded-[1.5rem] border-2 border-dashed border-gray-100">
                <Activity className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="enterprise-label !text-[10px] opacity-40">No se han detectado tratamientos activos</p>
                <button 
                    onClick={() => openSessionModal()}
                    className="mt-4 px-8 py-3 bg-white border-2 border-gray-100 text-brand-primary text-[9px] font-black uppercase tracking-widest rounded-xl hover:border-brand-primary transition-all"
                >
                    Iniciar Evaluación
                </button>
            </div>
        )}
      </div>
    </div>
  );
}