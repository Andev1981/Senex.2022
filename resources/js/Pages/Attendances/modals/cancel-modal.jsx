import React from "react";
import { router, useForm } from "@inertiajs/react";

export default function CancelModal({
  sessionData,
  setSessionData,
  setShowCancelModal,
}) {
  const { data, setData, post, patch, processing } = useForm({
    session_cancellation_notes: sessionData.session_cancellation_notes || "",
  });

  const cancelSession = () => {
    if (
      !data.session_cancellation_notes.trim() ||
      data.session_cancellation_notes.length < 10
    ) {
      alert(
        "Debes proporcionar un motivo de cancelación (mínimo 10 caracteres)"
      );
      return;
    }

    const sessionId = sessionData.session_id || sessionData.id;

    post(route("treatment-sessions.cancel", sessionId), {
      onSuccess: () => {
        setShowCancelModal(false);
        setSessionData(false);
      },
    });
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="space-y-4">
        <p className="text-sm font-medium text-gray-600 leading-relaxed">
            Está a punto de anular la sesión de <strong>{sessionData?.patient_full_name || sessionData?.paciente}</strong>. 
            Esta acción es reversible pero requiere un motivo justificado.
        </p>
        
        <div className="space-y-2">
            <label className="enterprise-label ml-1 opacity-60">Motivo de Cancelación</label>
            <textarea
                value={data.session_cancellation_notes}
                onChange={(e) => setData("session_cancellation_notes", e.target.value)}
                placeholder="Indique el motivo detallado (mínimo 10 caracteres)..."
                className="w-full p-4 rounded-2xl border-gray-100 bg-gray-50 text-sm font-medium focus:bg-white focus:ring-brand-primary transition-all resize-none h-32 shadow-inner"
            />
        </div>
      </div>

      <div className="flex gap-3 mt-auto pt-6 border-t border-gray-50">
        <button
          onClick={() => {
            setShowCancelModal(false);
            setSessionData(false);
          }}
          className="flex-1 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
          disabled={processing}
        >
          Descartar
        </button>
        <button
          onClick={cancelSession}
          disabled={processing || data.session_cancellation_notes.length < 10}
          className="flex-2 px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-lg shadow-red-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {processing ? "Procesando..." : "Confirmar Anulación"}
        </button>
      </div>
    </div>
  );
}
