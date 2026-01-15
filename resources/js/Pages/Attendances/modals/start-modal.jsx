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
    router.patch(
      route("attendances.start", sessionData.session_id),
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
    <div className="p-6 bg-white rounded-xl">
      <h3 className="mb-4 text-xl font-bold text-gray-900">Iniciar Sesión</h3>
      <p className="mb-4 text-sm text-gray-600">
        ¿Confirmas que deseas iniciar la sesión de{" "}
        <strong>{sessionData?.paciente}</strong>?
      </p>
      <textarea
        value={data.notes}
        onChange={(e) => setStartNotes(e.target.value)}
        placeholder="Notas iniciales (opcional)..."
        className="w-full p-3 border-2 border-gray-200 rounded-lg resize-none h-28 focus:border-blue-500 focus:outline-none"
      />
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => {
            setShowStartModal(false);
            setSessionData({});
          }}
          className="flex-1 px-4 py-2 font-semibold text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={startSession}
          className="flex-1 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Confirmar Inicio
        </button>
      </div>
    </div>
  );
}
