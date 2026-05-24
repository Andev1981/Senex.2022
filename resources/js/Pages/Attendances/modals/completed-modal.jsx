import React, { useState, useEffect } from "react";
import { fmtDate, fmtTime } from "@/utils/utils";
import { router, usePage } from "@inertiajs/react";
import {
  AVAILABLE_TECHNIQUES,
  AVAILABLE_EXERCISES,
} from "@/Constants/clinicalData";
import { 
  CheckCircle2, 
  User, 
  Activity, 
  ClipboardList, 
  Stethoscope, 
  Target, 
  Home, 
  Zap, 
  ChevronRight,
  Plus,
  XCircle,
  MessageSquare,
  History,
  Calendar,
  Clock
} from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

export default function CompletedModal({
  sessionData,
  setShowCompletedModal,
  setSessionData,
}) {
  const { errors } = usePage().props;

  // Inicializar estados seguros
  useEffect(() => {
    if (!sessionData.techniques) setSessionData(prev => ({ ...prev, techniques: [] }));
    if (!sessionData.exercises) setSessionData(prev => ({ ...prev, exercises: [] }));
    if (sessionData.pain_before === undefined) setSessionData(prev => ({ ...prev, pain_before: 0 }));
    if (sessionData.pain_after === undefined) setSessionData(prev => ({ ...prev, pain_after: 0 }));
  }, []);

  const getTechniques = () => Array.isArray(sessionData.techniques) ? sessionData.techniques : [];
  const getExercises = () => Array.isArray(sessionData.exercises) ? sessionData.exercises : [];

  const markCompleted = () => {
    const dataToSend = {
      ...sessionData,
      techniques: getTechniques(),
      exercises: getExercises(),
    };

    router.post(
      route("treatment-sessions.complete", sessionData.session_id),
      dataToSend,
      {
        onSuccess: () => {
          setShowCompletedModal(false);
          setSessionData({});
        },
        preserveScroll: true
      }
    );
  };

  const painDiff = (sessionData.pain_before || 0) - (sessionData.pain_after || 0);

  return (
    <div className="bg-white flex flex-col h-full animate-in fade-in duration-500">
      {/* HEADER HERO */}
      <div className="px-8 py-5 bg-gray-50/50 border-b border-gray-100 rounded-t-[2rem] flex items-center justify-between gap-6 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
        <div className="flex items-center gap-4 relative z-10">
            <div className="p-2.5 bg-green-500 text-white rounded-xl shadow-xl shadow-green-500/20 transform rotate-3">
                <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none mb-1">Finalizar Atención</h2>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">{sessionData?.patient_full_name} • Protocolo de Alta</p>
            </div>
        </div>
      </div>

      <div className="flex-1 p-8 space-y-10 overflow-y-auto custom-scrollbar">
        
        {/* INFO CARD COMPACTA */}
        <div className="p-5 bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-500/5 grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
            <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-brand-primary opacity-40" />
                <div>
                    <p className="text-[8px] font-black text-brand-gray uppercase tracking-widest leading-none mb-1">Fecha</p>
                    <p className="text-xs font-black text-gray-900 font-mono">{fmtDate(sessionData?.date)}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-brand-primary opacity-40" />
                <div>
                    <p className="text-[8px] font-black text-brand-gray uppercase tracking-widest leading-none mb-1">Hora</p>
                    <p className="text-xs font-black text-gray-900 font-mono">{sessionData?.time}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <History className="w-4 h-4 text-brand-primary opacity-40" />
                <div>
                    <p className="text-[8px] font-black text-brand-gray uppercase tracking-widest leading-none mb-1">Sesión n°</p>
                    <p className="text-xs font-black text-gray-900 font-mono">#{sessionData?.month_session_number}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-brand-primary opacity-40" />
                <div>
                    <p className="text-[8px] font-black text-brand-gray uppercase tracking-widest leading-none mb-1">Estado</p>
                    <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg border border-blue-100 uppercase tracking-widest">En Curso</span>
                </div>
            </div>
        </div>

        {/* EVALUACIÓN DEL DOLOR (DISEÑO PREMIUM) */}
        <div className="space-y-6">
            <h3 className="enterprise-label text-brand-primary! flex items-center gap-2 ml-1">
                <Activity className="w-4 h-4" /> Evolución del Dolor (EVA)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-blue-50/30 border border-blue-100 rounded-[2.5rem] relative overflow-hidden">
                <div className="space-y-6">
                    <div className="flex justify-between items-end px-1">
                        <label className="text-[10px] font-black text-blue-800/60 uppercase tracking-widest">Pre-Sesión</label>
                        <span className="text-3xl font-mono font-black text-blue-600">{sessionData.pain_before || 0}</span>
                    </div>
                    <input type="range" min="0" max="10" value={sessionData.pain_before || 0} onChange={e => setSessionData({...sessionData, pain_before: Number(e.target.value)})} className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600 shadow-inner" />
                </div>
                <div className="space-y-6">
                    <div className="flex justify-between items-end px-1">
                        <label className="text-[10px] font-black text-green-800/60 uppercase tracking-widest">Post-Sesión</label>
                        <span className="text-3xl font-mono font-black text-green-600">{sessionData.pain_after || 0}</span>
                    </div>
                    <input type="range" min="0" max="10" value={sessionData.pain_after || 0} onChange={e => setSessionData({...sessionData, pain_after: Number(e.target.value)})} className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600 shadow-inner" />
                </div>
                
                {painDiff !== 0 && (
                    <div className="md:col-span-2 pt-4 border-t border-blue-100 flex justify-center">
                        <div className={`px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-sm border ${painDiff > 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
                            {painDiff > 0 ? `Mejora de ${painDiff} puntos` : `Incremento de ${Math.abs(painDiff)} puntos`}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* CLÍNICA: TÉCNICAS & EJERCICIOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-gray-500/5 space-y-6">
                <h3 className="enterprise-label text-brand-primary! flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" /> Técnicas Aplicadas
                </h3>
                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TECHNIQUES.map(t => {
                        const selected = getTechniques().includes(t);
                        return (
                            <button key={t} onClick={() => setSessionData({...sessionData, techniques: selected ? getTechniques().filter(x => x !== t) : [...getTechniques(), t]})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selected ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105' : 'bg-gray-50 border-transparent text-brand-gray hover:bg-white hover:border-gray-200'}`}>
                                {t}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-gray-500/5 space-y-6">
                <h3 className="enterprise-label text-brand-primary! flex items-center gap-2">
                    <Target className="w-4 h-4" /> Plan de Ejercicios
                </h3>
                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_EXERCISES.map(e => {
                        const selected = getExercises().includes(e);
                        return (
                            <button key={e} onClick={() => setSessionData({...sessionData, exercises: selected ? getExercises().filter(x => x !== e) : [...getExercises(), e]})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selected ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200 scale-105' : 'bg-gray-50 border-transparent text-brand-gray hover:bg-white hover:border-gray-200'}`}>
                                {e}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* PROTOCOLO SOAP (ESTRUCTURADO) */}
        <div className="space-y-6">
            <h3 className="enterprise-label text-brand-primary! flex items-center gap-2 ml-1">
                <ClipboardList className="w-4 h-4" /> Protocolo SOAP
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* [S]ubjetivo */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 ml-1">
                        <span className="flex items-center justify-center w-6 h-6 bg-brand-primary text-white text-[10px] font-black rounded-lg shadow-sm">S</span>
                        <span className="text-[10px] font-black text-brand-gray uppercase tracking-widest">Subjetivo (Relato del paciente)</span>
                    </label>
                    <textarea 
                        value={sessionData.subjective || ""} 
                        onChange={e => setSessionData({...sessionData, subjective: e.target.value})} 
                        rows="3" 
                        className="w-full rounded-[1.5rem] border-gray-100 bg-gray-50/50 py-4 px-5 text-sm font-medium focus:bg-white focus:ring-brand-primary shadow-inner resize-none" 
                        placeholder="Sensaciones, síntomas reportados, nivel de dolor percibido..." 
                    />
                </div>

                {/* [O]bjetivo */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 ml-1">
                        <span className="flex items-center justify-center w-6 h-6 bg-brand-primary text-white text-[10px] font-black rounded-lg shadow-sm">O</span>
                        <span className="text-[10px] font-black text-brand-gray uppercase tracking-widest">Objetivo (Hallazgos físicos)</span>
                    </label>
                    <textarea 
                        value={sessionData.objective || ""} 
                        onChange={e => setSessionData({...sessionData, objective: e.target.value})} 
                        rows="3" 
                        className="w-full rounded-[1.5rem] border-gray-100 bg-gray-50/50 py-4 px-5 text-sm font-medium focus:bg-white focus:ring-brand-primary shadow-inner resize-none" 
                        placeholder="Rango de movimiento, fuerza, tests ortopédicos, palpación..." 
                    />
                </div>

                {/* [A]preciación */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 ml-1">
                        <span className="flex items-center justify-center w-6 h-6 bg-brand-primary text-white text-[10px] font-black rounded-lg shadow-sm">A</span>
                        <span className="text-[10px] font-black text-brand-gray uppercase tracking-widest">Apreciación (Juicio clínico)</span>
                    </label>
                    <textarea 
                        value={sessionData.assessment || ""} 
                        onChange={e => setSessionData({...sessionData, assessment: e.target.value})} 
                        rows="3" 
                        className="w-full rounded-[1.5rem] border-gray-100 bg-gray-50/50 py-4 px-5 text-sm font-medium focus:bg-white focus:ring-brand-primary shadow-inner resize-none" 
                        placeholder="Interpretación de los hallazgos, evolución respecto a la sesión anterior..." 
                    />
                </div>

                {/* [P]lan */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 ml-1">
                        <span className="flex items-center justify-center w-6 h-6 bg-brand-primary text-white text-[10px] font-black rounded-lg shadow-sm">P</span>
                        <span className="text-[10px] font-black text-brand-gray uppercase tracking-widest">Plan de Tratamiento</span>
                    </label>
                    <textarea 
                        value={sessionData.plan || ""} 
                        onChange={e => setSessionData({...sessionData, plan: e.target.value})} 
                        rows="3" 
                        className="w-full rounded-[1.5rem] border-gray-100 bg-gray-50/50 py-4 px-5 text-sm font-medium focus:bg-white focus:ring-brand-primary shadow-inner resize-none" 
                        placeholder="Objetivos para la próxima sesión, ajustes en la frecuencia..." 
                    />
                </div>
            </div>
        </div>

        {/* INDICACIONES PARA EL HOGAR */}
        <div className="space-y-6">
            <h3 className="enterprise-label text-brand-primary! flex items-center gap-2 ml-1">
                <Home className="w-4 h-4" /> Indicaciones Post-Sesión
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-brand-gray uppercase tracking-widest ml-1">Tareas & Terapia en el Hogar</label>
                    <textarea 
                        value={sessionData.homework || ""} 
                        onChange={e => setSessionData({...sessionData, homework: e.target.value})} 
                        rows="3" 
                        className="w-full rounded-[1.5rem] border-gray-100 bg-gray-50/50 py-4 px-5 text-sm font-medium focus:bg-white focus:ring-brand-primary shadow-inner resize-none" 
                        placeholder="Ejercicios específicos, aplicación de frío/calor, reposo..." 
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-brand-gray uppercase tracking-widest ml-1">Observaciones Generales</label>
                    <textarea 
                        value={sessionData.notes || ""} 
                        onChange={e => setSessionData({...sessionData, notes: e.target.value})} 
                        rows="3" 
                        className="w-full rounded-[1.5rem] border-gray-100 bg-gray-50/50 py-4 px-5 text-sm font-medium focus:bg-white focus:ring-brand-primary shadow-inner resize-none" 
                        placeholder="Notas administrativas o comentarios adicionales..." 
                    />
                </div>
            </div>
        </div>
      </div>

      {/* FOOTER FIJO PREMIUM */}
      <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0 rounded-b-[2rem]">
        <SecondaryButton onClick={() => setShowCompletedModal(false)} className="px-8! py-3!">Descartar</SecondaryButton>
        <PrimaryButton onClick={markCompleted} className="px-10! py-3! shadow-xl shadow-brand-primary/20">
            Confirmar Cierre de Sesión
        </PrimaryButton>
      </div>
    </div>
  );
}