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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-md">
      <div className="w-full max-w-md p-10 text-center duration-300 bg-white shadow-2xl rounded-[2.5rem] animate-in fade-in zoom-in border border-gray-100">
        {/* Spinner Animado */}
        <div className="relative flex justify-center mb-8">
          <Loader2 className="w-20 h-20 text-brand-primary animate-spin opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-brand-primary rounded-full animate-ping"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
          </div>
        </div>

        <h2 className="mb-2 text-2xl font-black text-gray-900 tracking-tight">
          Procesando Pago
        </h2>

        <p className="mb-10 text-sm font-bold leading-relaxed text-brand-gray uppercase tracking-tight opacity-80">
          {message ||
            "Por favor, sigue las instrucciones en el terminal de pago."}
          <span className="block mt-3 font-black text-brand-primary animate-pulse tracking-widest text-[10px]">
            POR FAVOR, NO CIERRE ESTA VENTANA
          </span>
        </p>

        {/* Botones de Control */}
        {isAbortable && (
          <button
            onClick={onAbort}
            className="flex items-center justify-center w-full py-5 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border-2 group bg-gray-50 text-gray-400 rounded-2xl border-gray-100 hover:border-red-200 hover:text-red-600 hover:bg-red-50 active:scale-95 shadow-sm"
          >
            <XCircle className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
            Abortar Transacción
          </button>
        )}

        <div className="mt-8 flex items-center justify-center text-[9px] text-gray-400 uppercase tracking-[0.2em] font-black opacity-60">
          <AlertTriangle className="w-3.5 h-3.5 mr-2 text-amber-500" />
          Pasarela de Pago Segura
        </div>
      </div>
    </div>
  );
};

export default PaymentBlockingModal;
