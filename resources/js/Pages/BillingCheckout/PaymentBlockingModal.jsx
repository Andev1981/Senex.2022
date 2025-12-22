import React from "react";
import { Loader2, AlertTriangle, XCircle } from "lucide-react";

const PaymentBlockingModal = ({
  isOpen,
  message,
  onAbort,
  isAbortable = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
      <div className="w-full max-w-md p-8 text-center duration-300 bg-white shadow-2xl rounded-3xl animate-in fade-in zoom-in">
        {/* Spinner Animado */}
        <div className="relative flex justify-center mb-6">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
          </div>
        </div>

        <h2 className="mb-2 text-2xl font-black text-slate-800">
          Procesando Pago
        </h2>

        <p className="mb-8 font-medium leading-relaxed text-slate-500">
          {message ||
            "Por favor, sigue las instrucciones en el terminal de pago."}
          <span className="block mt-2 font-bold text-indigo-600 animate-pulse">
            No cierres esta ventana.
          </span>
        </p>

        {/* Botones de Control */}
        {isAbortable && (
          <button
            onClick={onAbort}
            className="flex items-center justify-center w-full py-4 font-bold transition-all duration-200 border-2 group bg-slate-50 text-slate-400 rounded-2xl border-slate-100 hover:border-red-200 hover:text-red-600 hover:bg-red-50"
          >
            <XCircle className="w-5 h-5 mr-2 group-hover:shake" />
            Abortar Transacción
          </button>
        )}

        <div className="mt-6 flex items-center justify-center text-[10px] text-slate-400 uppercase tracking-widest font-black">
          <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" />
          Conexión Segura con Transbank
        </div>
      </div>
    </div>
  );
};

export default PaymentBlockingModal;
