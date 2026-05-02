import { XCircle } from "lucide-react";
import { fmtCLP, fmtDate } from "@/utils/utils";
import { estadoClass, estadoTexto } from "@/helpers/status";

export default function ResumeModal({ sessionData, setShowResumenModal }) {
  return (
    <div className="space-y-3">
      {/* Información del Paciente */}
        <div className="p-3 border border-blue-100 rounded-2xl bg-blue-50/50">
          <h4 className="mb-1 text-[10px] font-black text-blue-900 uppercase tracking-widest opacity-60">Paciente</h4>
          <p className="text-base font-black text-blue-900 uppercase tracking-tight">
            {sessionData?.patient_full_name}
          </p>
          <div className="flex gap-3 mt-1">
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">
                RUT: {sessionData?.patient_rut}
            </p>
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">
                Tel: {sessionData?.patient_phone}
            </p>
          </div>
        </div>

        {/* Detalles de la Sesión */}
        <div className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
          <h4 className="mb-3 text-[10px] font-black text-gray-900 uppercase tracking-widest opacity-60">
            Detalles Cronológicos
          </h4>
          <div className="space-y-2.5 text-xs font-bold uppercase tracking-tight">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Fecha de Atención:</span>
              <span className="text-gray-900 font-black">
                {fmtDate(sessionData?.date)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Hora de Inicio:</span>
              <span className="text-gray-900 font-black">{sessionData?.time}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Profesional:</span>
              <span className="text-gray-900 font-black">
                {sessionData?.doctor_full_name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Tipo de Servicio:</span>
              <span className="text-brand-primary font-black capitalize">
                {sessionData?.name_session_type}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Estado:</span>
              <span
                className={`px-2 py-0.5 text-[9px] font-black rounded-lg uppercase tracking-widest border ${estadoClass(
                  sessionData?.status
                )}`}
              >
                {estadoTexto(sessionData?.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Información de Pago */}
        <div className="p-4 border border-purple-100 rounded-2xl bg-purple-50/50">
          <h4 className="mb-3 text-[10px] font-black text-purple-900 uppercase tracking-widest opacity-60">
            Resumen Financiero
          </h4>
          <div className="space-y-2.5 text-xs font-bold uppercase tracking-tight">
            <div className="flex justify-between items-center">
              <span className="text-purple-700/60">Arancel Pactado:</span>
              <span className="font-black text-purple-900 font-mono">
                {fmtCLP(sessionData?.patient_amount_clp)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-700/60">Total Recaudado:</span>
              <span className="font-black text-green-600 font-mono">
                {fmtCLP(sessionData?.total_payment)}
              </span>
            </div>
            {sessionData?.patient_amount_clp - sessionData?.total_payment > 0 && (
              <div className="flex justify-between pt-2 border-t border-purple-200 mt-1">
                <span className="font-black text-red-600 uppercase tracking-widest">Saldo Deudor:</span>
                <span className="font-black text-red-600 font-mono text-sm">
                  {fmtCLP(sessionData?.patient_amount_clp - sessionData?.total_payment)}
                </span>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
