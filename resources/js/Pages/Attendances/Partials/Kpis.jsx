import React from "react";
import {
  Calendar,
  CheckCircle2,
  DollarSign,
  Timer,
  Activity,
  Wallet
} from "lucide-react";
import { fmtCLP, fmtShortDate } from "@/utils/utils";

export default function Kpis({ kpis, filtros }) {
  const fechaInicio = filtros.fecha_inicio || new Date().toISOString().split("T")[0];
  const fechaFin = filtros.fecha_fin || new Date().toISOString().split("T")[0];

  return (
    <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* TOTAL ATENCIONES */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-enterprise hover:scale-[1.02] transition-all duration-300 group border-b-4 border-b-brand-primary">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-brand-secondary/10 text-brand-primary rounded-xl group-hover:bg-brand-primary group-hover:text-white transition-all">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[8px] font-black text-brand-gray uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg">
            {fechaInicio === fechaFin ? fmtShortDate(fechaInicio) : 'Período'}
          </span>
        </div>
        <p className="enterprise-label !text-[8px] opacity-60 mb-1">Volumen Total</p>
        <p className="text-3xl font-black text-gray-900 font-mono tracking-tighter">{kpis.total || 0}</p>
      </div>

      {/* COMPLETADAS */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-enterprise hover:scale-[1.02] transition-all duration-300 group border-b-4 border-b-green-500">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-all">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-[8px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-lg">Realizadas</span>
        </div>
        <p className="enterprise-label !text-[8px] opacity-60 mb-1">Sesiones Éxito</p>
        <p className="text-3xl font-black text-green-700 font-mono tracking-tighter">{kpis.completadas || 0}</p>
      </div>

      {/* PENDIENTES */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-enterprise hover:scale-[1.02] transition-all duration-300 group border-b-4 border-b-amber-400">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-all">
            <Timer className="w-5 h-5" />
          </div>
          <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-lg">Agendadas</span>
        </div>
        <p className="enterprise-label !text-[8px] opacity-60 mb-1">Citas en Espera</p>
        <p className="text-3xl font-black text-amber-700 font-mono tracking-tighter">{kpis.pendientes || 0}</p>
      </div>

      {/* FINANZAS */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-enterprise hover:scale-[1.02] transition-all duration-300 group border-b-4 border-b-purple-500">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-[8px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-1 rounded-lg">Caja</span>
        </div>
        <p className="enterprise-label !text-[8px] opacity-60 mb-1">Cobrado / Pendiente</p>
        <div className="flex items-baseline gap-2">
            <p className="text-lg font-black text-gray-900 font-mono tracking-tighter">{fmtCLP(kpis.totalCobrado || 0)}</p>
            <span className="text-[10px] font-bold text-gray-300">/</span>
            <p className="text-xs font-bold text-brand-primary font-mono">{fmtCLP(kpis.totalPorCobrar || 0)}</p>
        </div>
      </div>
    </div>
  );
}