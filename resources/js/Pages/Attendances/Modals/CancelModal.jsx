import React from "react";
import { router, useForm } from "@inertiajs/react";

export default function CancelModal({
  sessionData,
  setSessionData,
  setShowCancelModal,
}) {
  const { data, setData } = useForm({
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

    router.post(
      route("attendances.cancel", sessionData.id),
      { session_cancellation_notes: data.session_cancellation_notes },
      {
        onSuccess: () => {
          setSessionData(false);
        },
      }
    );
  };

  return (
    <div className="p-6 bg-white">
      <h3 className="mb-4 text-xl font-bold text-gray-900">Cancelar Sesión</h3>
      <p className="mb-4 text-sm text-gray-600">
        Proporciona un motivo para la cancelación de la sesión de{" "}
        <strong>{sessionData?.paciente}</strong>
      </p>
      <textarea
        value={sessionData.session_cancellation_notes}
        onChange={(e) => setData("session_cancellation_notes", e.target.value)}
        placeholder="Motivo de cancelación (mínimo 10 caracteres)..."
        className="w-full p-3 border-2 border-gray-200 rounded-lg resize-none h-28 focus:border-blue-500 focus:outline-none"
      />
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => {
            setShowCancelModal(false);
            setSessionData(false);
          }}
          className="flex-1 px-4 py-2 font-semibold text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={cancelSession}
          className="flex-1 px-4 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          Confirmar Cancelación
        </button>
      </div>
    </div>
  );
}
