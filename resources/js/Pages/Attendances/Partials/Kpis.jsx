import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  DollarSign,
  Timer,
} from "lucide-react";
import { fmtCLP, fmtShortDate } from "@/utils/utils";
import { useState } from "react";

export default function Kpis({ kpis, filtros }) {
  const [fechaInicio, setFechaInicio] = useState(
    filtros.fecha_inicio || new Date().toISOString().split("T")[0]
  );
  const [fechaFin, setFechaFin] = useState(
    filtros.fecha_fin || new Date().toISOString().split("T")[0]
  );
  return (
    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-semibold text-gray-500">
            {fechaInicio === fechaFin
              ? fmtShortDate(fechaInicio)
              : `${fmtShortDate(fechaInicio)} - ${fmtShortDate(fechaFin)}`}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          {fechaInicio === fechaFin
            ? "Atenciones del día"
            : "Atenciones del período"}
        </p>
        <p className="text-3xl font-bold text-gray-900">{kpis.total || 0}</p>
      </div>
      <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="w-4 h-4" />
            ok
          </span>
        </div>
        <p className="text-sm text-gray-600">Completadas</p>
        <p className="text-3xl font-bold text-gray-900">
          {kpis.completadas || 0}
        </p>
      </div>
      <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
            <Timer className="w-5 h-5 text-white" />
          </div>
          <span className="inline-flex items-center text-xs font-semibold text-amber-600">
            <ArrowDownRight className="w-4 h-4" />
            pend
          </span>
        </div>
        <p className="text-sm text-gray-600">Pendientes</p>
        <p className="text-3xl font-bold text-gray-900">
          {kpis.pendientes || 0}
        </p>
      </div>
      <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="text-sm text-gray-600">Cobrado / Por cobrar</p>
        <p className="text-xl font-bold text-gray-900">
          {fmtCLP(kpis.totalCobrado || 0)}{" "}
          <span className="font-medium text-gray-400">
            / {fmtCLP(kpis.totalPorCobrar || 0)}
          </span>
        </p>
      </div>
    </div>
  );
}
