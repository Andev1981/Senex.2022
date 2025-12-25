import { XCircle } from "lucide-react";
import Chip from "@/Components/ui/Chip";
import { fmtCLP, fmtDate } from "@/utils/utils";
import { estadoClass, estadoTexto } from "@/helpers/status";

export default function ResumeModal({
  sessionData,
  setShowResumenModal,
  openDTEModal,
}) {
  return (
    <div className="p-6 bg-white rounded-xl">
      <div className="space-y-4">
        {/* Información del Paciente */}
        <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
          <h4 className="mb-2 text-sm font-bold text-blue-900">Paciente</h4>
          <p className="text-lg font-bold text-blue-900">
            {sessionData?.patient_full_name}
          </p>
          <p className="text-sm text-blue-700">
            RUT: {sessionData?.patient_rut}
          </p>
          <p className="text-sm text-blue-700">
            Tel: {sessionData?.patient_phone}
          </p>
        </div>

        {/* Detalles de la Sesión */}
        <div className="p-4 border-2 border-gray-200 rounded-lg">
          <h4 className="mb-3 text-sm font-bold text-gray-900">
            Información de la Sesión
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha:</span>
              <span className="font-semibold">
                {fmtDate(sessionData?.date)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hora:</span>
              <span className="font-semibold">{sessionData?.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Profesional:</span>
              <span className="font-semibold">
                {sessionData?.doctor_full_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tipo:</span>
              <span className="font-semibold capitalize">
                {sessionData?.name_session_type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estado:</span>
              <Chip
                color={estadoClass(sessionData?.status)}
                text={estadoTexto(sessionData?.status)}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sucursal:</span>
              <span className="font-semibold">{sessionData?.sucursal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sala:</span>
              <span className="font-semibold">{sessionData?.sala}</span>
            </div>
          </div>
        </div>

        {/* Información de Pago */}
        <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
          <h4 className="mb-3 text-sm font-bold text-purple-900">
            Información de Pago
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-700">Copago:</span>
              <span className="font-semibold text-purple-900">
                {fmtCLP(sessionData?.copay_clp)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-700">Total:</span>
              <span className="font-semibold text-purple-900">
                {fmtCLP(sessionData?.patient_amount_clp)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-700">Pagado:</span>
              <span className="font-semibold text-purple-900">
                {fmtCLP(sessionData?.total_payment)}
              </span>
            </div>
            {sessionData?.patient_amount_clp - sessionData?.total_payment >
              0 && (
              <div className="flex justify-between pt-2 border-t border-purple-300">
                <span className="font-bold text-purple-900">Saldo:</span>
                <span className="font-bold text-purple-900">
                  {fmtCLP(
                    sessionData?.patient_amount_clp - sessionData?.total_payment
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-2">
          {["completed", "scheduled"].includes(sessionData?.status) && (
            <button
              onClick={() => {
                setShowResumenModal(false);
                openDTEModal(sessionData);
              }}
              className="flex-1 px-4 py-2 font-semibold text-purple-700 border-2 border-purple-200 rounded-lg hover:bg-purple-50"
            >
              Emitir DTE
            </button>
          )}

          <button
            onClick={() => {
              setShowResumenModal(false);
            }}
            className="px-4 py-2 font-semibold text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
