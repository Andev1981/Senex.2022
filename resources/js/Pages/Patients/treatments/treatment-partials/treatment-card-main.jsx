import React from "react";
import { getStatusConfig } from "@/constants/treatmentStatuses";
import {
  TrendingDown, // Cambio a Down para dolor (es bueno que baje)
  TrendingUp,
  Activity,
  Award,
  Calendar,
  Clock,
  Target,
  Repeat,
  User,
  ChevronRight
} from "lucide-react";

export default function TreatmentCardMain({ treatment, handleTreatmentModal }) {
  
  // Cálculo de porcentaje seguro
  const progressPercent = treatment.total_sessions > 0 
    ? Math.min((treatment.completed_sessions / treatment.total_sessions) * 100, 100) 
    : 0;

  return (
    <div className="bg-white rounded-[1.5rem] border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      
      {/* --- HEADER: Título y Estado --- */}
      <div className="p-6 border-b border-gray-50">
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${getStatusConfig(treatment.status).className.replace('bg-', 'bg-opacity-10 border-')}`}>
                {getStatusConfig(treatment.status).label}
              </span>
              {treatment.length > 1 && (
                 <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                    <Repeat className="w-3 h-3" /> Histórico
                 </span>
              )}
            </div>
            <h3 className="text-xl font-black text-gray-800 leading-tight mb-1">
              {treatment.diagnosis}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <User className="w-4 h-4 text-brand-primary" />
              {treatment?.doctor?.name} {treatment?.doctor?.last_name}
            </div>
          </div>

          <button
            onClick={() => handleTreatmentModal(treatment)}
            className="p-2 text-gray-400 hover:text-brand-primary hover:bg-gray-50 rounded-xl transition-all"
            title="Ver/Editar Detalles"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* --- BODY: Progreso Principal --- */}
      <div className="px-6 py-6">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avance del Plan</p>
            <p className="text-3xl font-black text-gray-900">
                {treatment.completed_sessions}
                <span className="text-lg text-gray-400 font-bold ml-1">
                    / {treatment.is_indefinite ? '∞' : treatment.total_sessions}
                </span>
            </p>
          </div>
          <div className="text-right">
             <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded">
                {treatment.is_indefinite ? 'Continuo' : `${Math.round(progressPercent)}% Completado`}
             </span>
          </div>
        </div>
        
        {/* Barra de Progreso */}
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
                className="h-full bg-brand-primary rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${treatment.is_indefinite ? 100 : progressPercent}%` }}
            >
                {/* Efecto de brillo en la barra */}
                <div className="absolute top-0 left-0 bottom-0 right-0 bg-white/20 w-full animate-pulse"></div>
            </div>
        </div>
      </div>

      {/* --- KPIs: Métricas Clínicas (Grid limpio) --- */}
      <div className="grid grid-cols-3 border-t border-b border-gray-100 divide-x divide-gray-100 bg-gray-50/50">
        
        <div className="p-4 flex flex-col items-center justify-center text-center group/kpi">
            <div className="mb-2 p-2 bg-blue-50 text-blue-600 rounded-xl group-hover/kpi:scale-110 transition-transform">
                <TrendingDown className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Dolor</p>
            <p className="text-lg font-black text-gray-800">-{treatment?.pain_reduction || 0}%</p>
        </div>

        <div className="p-4 flex flex-col items-center justify-center text-center group/kpi">
            <div className="mb-2 p-2 bg-purple-50 text-purple-600 rounded-xl group-hover/kpi:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Movilidad</p>
            <p className="text-lg font-black text-gray-800">+{treatment?.mobility_improvement || 0}%</p>
        </div>

        <div className="p-4 flex flex-col items-center justify-center text-center group/kpi">
            <div className="mb-2 p-2 bg-orange-50 text-orange-600 rounded-xl group-hover/kpi:scale-110 transition-transform">
                <Award className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Fuerza</p>
            <p className="text-lg font-black text-gray-800">+{treatment?.strength_gain || 0}%</p>
        </div>

      </div>

      {/* --- FOOTER: Detalles y Objetivos --- */}
      <div className="p-6 grid grid-cols-1 gap-8 text-sm">
        
        {/* Columna Izquierda: Datos Duros */}
        <div className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-3 h-3" /> Configuración
            </h4>
            <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500 font-medium">Inicio</span>
                    <span className="font-bold text-gray-700">{new Date(treatment.start_date).toLocaleDateString("es-CL")}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500 font-medium">Frecuencia</span>
                    <span className="font-bold text-gray-700 capitalize">
                        {treatment.frequency} x {treatment.frequency_time === 'week' ? 'Semana' : 'Mes'}
                    </span>
                </div>
                {treatment.next_appointment && (
                    <div className="flex justify-between items-center pt-1">
                        <span className="text-gray-500 font-medium">Próxima Cita</span>
                        <span className="font-bold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded text-xs">
                            {new Date(treatment.next_appointment).toLocaleDateString("es-CL")}
                        </span>
                    </div>
                )}
            </div>
        </div>

        {/* Columna Derecha: Objetivos */}
        <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Target className="w-3 h-3" /> Objetivos Clínicos
            </h4>
            <div className="space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
                {(!treatment.objectives || treatment.objectives.length === 0) ? (
                    <p className="text-gray-400 italic text-xs">No hay objetivos registrados.</p>
                ) : (
                    treatment.objectives.map((obj, i) => (
                        <div key={i} className="flex gap-3 items-start group/obj">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-secondary group-hover/obj:bg-brand-primary transition-colors flex-shrink-0"></div>
                            <p className="text-gray-600 leading-relaxed text-xs">{obj}</p>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
}