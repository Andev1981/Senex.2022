import { fmtCLP, fmtDate } from "@/utils/utils";
import { RefreshCw, Receipt, Layers } from "lucide-react";
import { router } from "@inertiajs/react";
import { useState } from "react";
import Swal from "sweetalert2";

export default function DteModal({
  sessionData,
  setShowDTEModal,
  setSessionData,
}) {
  const [processing, setProcessing] = useState(false);
  const [dteType, setDteType] = useState(41); // 41 = Boleta Exenta, 34 = Factura Exenta

  if (!sessionData) return null;

  // Normalizar data (si es uno solo, convertir a array)
  const isBulk = Array.isArray(sessionData);
  const sessions = (isBulk ? sessionData : [sessionData]).filter(s => s !== null && s !== undefined);
  const mainSession = sessions[0];

  if (sessions.length === 0) return null;

  const totalAmount = sessions.reduce(
    (sum, s) => sum + (s?.patient_amount_clp || 0),
    0
  );

  const issueDTE = () => {
    setProcessing(true);

    const payload = {
      dte_type: dteType,
      issue_date: new Date().toISOString().split("T")[0],
      patient_id: mainSession.patient_id,
      client: {
        rut: mainSession.patient_rut,
        razonSocial: mainSession.patient_full_name,
        giro: dteType === 34 ? "Servicios de Salud" : "Particular",
        direccion: "",
        comuna: "",
      },
      items: sessions.map((s) => ({
        description: `SESIÓN ${s?.name_session_type} - ${fmtDate(s?.date)}`,
        quantity: 1,
        unitPrice: s.patient_amount_clp,
        discount_clp: 0,
        is_exempt: true,
        sellable_type: "TreatmentSession",
        sellable_id: s.session_id,
      })),
      payment_method: "Efectivo",
      simulate: false,
      issue: true // Flag para emisión inmediata
    };

    router.post(route("documents.store"), payload, {
      onSuccess: () => {
        setShowDTEModal(false);
        setSessionData(null);
        Swal.fire("¡Éxito!", "DTE generado correctamente", "success");
      },
      onError: (errors) => {
        console.error(errors);
        Swal.fire(
          "Error",
          errors.dte_error || "No se pudo generar el DTE",
          "error"
        );
      },
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div className="p-6 bg-white rounded-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 text-purple-600 bg-purple-100 rounded-2xl">
          <Receipt className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-black tracking-tight text-gray-900 uppercase">
            Emitir DTE {isBulk ? "Masivo" : ""}
          </h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {isBulk
              ? `${sessions.length} Sesiones seleccionadas`
              : "Documento Individual"}
          </p>
        </div>
      </div>

      <div className="p-6 mb-6 border-2 border-gray-100 rounded-2xl bg-gray-50/50">
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => setDteType(41)}
              className={`p-3 rounded-xl border-2 transition-all text-[10px] font-black uppercase tracking-widest ${
                dteType === 41
                  ? "border-purple-500 bg-purple-50 text-purple-700 shadow-sm"
                  : "border-gray-100 bg-white text-gray-400"
              }`}
            >
              Boleta Exenta
            </button>
            <button
              onClick={() => setDteType(34)}
              className={`p-3 rounded-xl border-2 transition-all text-[10px] font-black uppercase tracking-widest ${
                dteType === 34
                  ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                  : "border-gray-100 bg-white text-gray-400"
              }`}
            >
              Factura Exenta
            </button>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Paciente
            </span>
            <span className="font-black text-gray-900 uppercase truncate max-w-[200px]">
              {mainSession?.patient_full_name}
            </span>
          </div>

          <div className="pr-2 overflow-y-auto max-h-48 custom-scrollbar">
            {sessions.map((s, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-2 text-[11px]"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700 uppercase">
                    {s?.name_session_type}
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono">
                    {fmtDate(s?.date)} {s?.time}
                  </span>
                </div>
                <span className="font-mono font-black text-gray-900">
                  {fmtCLP(s?.patient_amount_clp)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-2 border-t-2 border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-widest text-gray-900 uppercase">
                Total a Facturar
              </span>
              <span className="font-mono text-xl font-black text-brand-primary">
                {fmtCLP(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowDTEModal(false);
            setSessionData(null);
          }}
          disabled={processing}
          className="flex-1 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={issueDTE}
          disabled={processing}
          className="flex-2 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-purple-600 rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {processing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Receipt className="w-4 h-4" /> Emitir Boleta SII
            </>
          )}
        </button>
      </div>
    </div>
  );
}
