import { useForm, router } from "@inertiajs/react";
import React from "react";

export default function AbsentModal({
  sessionData,
  setShowAbsentModal,
  setSessionData,
}) {
  const { data, setData } = useForm({
    session_absent_notes: sessionData?.session_absent_notes || "",
  });

  // Marcar como ausente
  const markAbsent = () => {
    if (!data.session_absent_notes) {
      alert("⚠️ Debes seleccionar un motivo");
      return;
    }

    router.post(
      route("treatment-sessions.absent", sessionData.session_id),
      { reason: data.session_absent_notes },
      {
        onSuccess: () => {
          alert(
            `⚠️ Paciente marcado como ausente: ${sessionData.patient_full_name}`
          );
          setSessionData(false);
        },
        onError: () => {
          alert("❌ Error al marcar ausencia");
        },
      }
    );
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="space-y-6">
        <p className="text-sm font-medium text-gray-600 leading-relaxed">
            Registre el motivo de inasistencia para <strong>{sessionData?.patient_full_name}</strong>. 
        </p>

        <div className="space-y-3">
            <label className="enterprise-label ml-1 opacity-60">Motivo de Ausencia</label>
            <select
                value={data.session_absent_notes}
                onChange={(e) => setData("session_absent_notes", e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-gray-100 bg-gray-50 font-bold text-sm focus:bg-white focus:ring-brand-primary transition-all"
            >
                <option value="">Seleccionar motivo...</option>
                <option value="no_show">No se presentó</option>
                <option value="late_cancellation">Cancelación tardía</option>
                <option value="emergency">Emergencia personal</option>
                <option value="health_issue">Problema de salud</option>
                <option value="other">Otro</option>
            </select>

            {data.session_absent_notes === "other" && (
                <textarea
                    placeholder="Describe el motivo..."
                    className="w-full p-4 rounded-2xl border-gray-100 bg-gray-50 text-sm font-medium focus:bg-white focus:ring-brand-primary transition-all resize-none h-24 shadow-inner"
                />
            )}
        </div>

        <div className="p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl flex items-start gap-4">
            <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-tight">
            ⚠️ <strong>Importante:</strong> Si el paciente consume un plan, la
            sesión NO se devolverá automáticamente.
            </p>
        </div>
      </div>

      <div className="flex gap-3 mt-auto pt-6 border-t border-gray-50">
        <button
          onClick={() => {
            setShowAbsentModal(false);
            setSessionData({});
          }}
          className="flex-1 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={markAbsent}
          disabled={!data.session_absent_notes}
          className="flex-2 px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-orange-600 rounded-xl hover:bg-orange-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-orange-100"
        >
          Confirmar Ausencia
        </button>
      </div>
    </div>
  );
}
