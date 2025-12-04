import { fmtCLP, fmtDate } from "@/utils/utils";

export default function DteModal({
  sessionData,
  setShowDTEModal,
  setSessionData,
}) {
  const issueDTE = () => {
    // Aquí va tu lógica real de DTE
    alert(`Emitiendo DTE para ${sessionData.paciente}...`);

    // router.post(route("attendances.dte", sessionData.id), {}, {
    //   onSuccess: () => {
    //     setShowDTEModal(false);
    //     setSessionData(null);
    //   },
    // });
  };

  return (
    <div className="p-6 bg-white rounded-xl">
      <h3 className="mb-4 text-xl font-bold text-gray-900">
        Emitir Documento Tributario Electrónico
      </h3>
      <div className="p-4 mb-4 border-2 border-gray-200 rounded-lg bg-gray-50">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Paciente:</span>
            <span className="font-semibold">
              {sessionData?.patient_full_name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fecha:</span>
            <span className="font-semibold">{fmtDate(sessionData?.date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Hora:</span>
            <span className="font-semibold">{sessionData?.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tipo:</span>
            <span className="font-semibold capitalize">
              {sessionData?.name_session_type}
            </span>
          </div>
          <div className="pt-2 mt-2 border-t border-gray-300">
            <div className="flex justify-between text-base">
              <span className="font-bold text-gray-900">Total:</span>
              <span className="font-bold text-gray-900">
                {fmtCLP(sessionData?.patient_amount)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            setShowDTEModal(false);
            setSessionData(null);
          }}
          className="flex-1 px-4 py-2 font-semibold text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={issueDTE}
          className="flex-1 px-4 py-2 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700"
        >
          Emitir Boleta
        </button>
      </div>
    </div>
  );
}
