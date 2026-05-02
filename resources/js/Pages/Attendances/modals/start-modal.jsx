import React from "react";
import { router, useForm } from "@inertiajs/react";

export default function StartModal({
  sessionData,
  setShowStartModal,
  setSessionData,
}) {
  const { data } = useForm({
    notes: sessionData?.session_start_notes || "",
  });
  const startSession = () => {
    router.post(
      route("treatment-sessions.start", sessionData.session_id),
      {},
      {
        onSuccess: () => {
          setShowStartModal(false);
        },
        preserveScroll: true,
      }
    );
  };

  return (
    <div className="space-y-8 flex flex-col h-full">
      <div className="space-y-4">
        <p className="text-sm font-medium text-gray-600 leading-relaxed">
            ¿Confirmas que deseas iniciar la sesión clínica de <strong>{sessionData?.paciente || sessionData?.patient_full_name}</strong>? 
            Se registrará la hora de inicio actual.
        </p>
        
        <div className="space-y-2">
            <label className="enterprise-label ml-1 opacity-60">Notas Iniciales (Opcional)</label>
            <textarea
                value={data.notes}
                onChange={(e) => setData("notes", e.target.value)}
                placeholder="Indique cualquier observación previa..."
                className="w-full p-4 rounded-2xl border-gray-100 bg-gray-50 text-sm font-medium focus:bg-white focus:ring-brand-primary transition-all resize-none h-32 shadow-inner"
            />
        </div>
      </div>

      <div className="flex gap-3 mt-auto pt-6 border-t border-gray-50">
        <button
          onClick={() => {
            setShowStartModal(false);
            setSessionData({});
          }}
          className="flex-1 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={startSession}
          className="flex-2 px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-brand-primary rounded-xl hover:brightness-110 shadow-lg shadow-brand-primary/20 transition-all active:scale-95"
        >
          Confirmar Inicio
        </button>
      </div>
    </div>
  );
}
