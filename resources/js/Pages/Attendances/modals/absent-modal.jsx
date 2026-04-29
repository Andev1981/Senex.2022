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

    router.patch(
      `/attendances/${sessionData.session_id}/absent`,
      { reason: data.session_absent_notes },
      {
        onSuccess: () => {
          alert(
            `⚠️ Paciente marcado como ausente: ${sessionData.patient_full_name}`
          );
          setSessionData(false);
        },
        onError: () => {
          alert.error("❌ Error al marcar ausencia");
        },
      }
    );
  };

  return (
    <div className="p-6 bg-white rounded-xl">
      <h3 className="mb-4 text-xl font-bold text-gray-900">
        ⚠️ Marcar como Ausente
      </h3>
      <p className="mb-4 text-sm text-gray-600">
        Registra el motivo de ausencia de{" "}
        <strong>{sessionData?.patient_full_name}</strong>
      </p>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-bold text-gray-700">
          Motivo de Ausencia
        </label>
        <select
          value={data.session_absent_notes}
          onChange={(e) => setData("session_absent_notes", e.target.value)}
          className="w-full px-3 py-2 mb-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
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
            className="w-full p-3 border-2 border-gray-200 rounded-lg resize-none h-20 focus:border-blue-500 focus:outline-none"
          />
        )}
      </div>

      <div className="p-3 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ <strong>Importante:</strong> Si el paciente consume un plan, la
          sesión NO se devolverá automáticamente.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setShowAbsentModal(false);
            setSessionData({});
          }}
          className="flex-1 px-4 py-2 font-semibold text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={markAbsent}
          disabled={!data.session_absent_notes}
          className="flex-1 px-4 py-2 font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          ⚠️ Confirmar Ausencia
        </button>
      </div>
    </div>
  );
}
