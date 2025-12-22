import React, { useMemo, useState } from "react";
import { Activity, Plus, Clipboard, ClipboardList } from "lucide-react";
import CardTreatment from "./HistorialPartials/CardTreatment";
import SideModal from "@/Components/SideModal";
import ModalCreateUpdateTreatment from "./HistorialPartials/ModalCreateUpdateTreatment";

export default function IndexHistorial({
  patient,
  doctors,
  session_types,
  treatments = [],
  diagnostics = [],
}) {
  // 1) Normaliza tratamientos a array
  /*  const treatments = Array.isArray(treatments) ? treatments : null; */

  // 2) Estados derivados
  const isLoading = patient == null || treatments == null; // aún no llega la data
  const isEmpty =
    !isLoading && Array.isArray(treatments) && treatments.length === 0;

  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [openTreatmentModal, setOpenTreatmentModal] = useState(false);
  const mainContact = patient?.contacts?.find((c) => c?.is_primary == true);

  const handleTreatmentModal = (treatment) => {
    setSelectedTreatment(treatment);
    setOpenTreatmentModal(true);
  };

  const STATUS_ORDER = [
    "in_progress",
    "evaluation",
    "cancelled",
    "paused",
    "completed",
  ];

  const sortedTreatments = [...treatments].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  );

  const fromCsv = (v) =>
    Array.isArray(v)
      ? v
      : typeof v === "string"
      ? v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  return (
    <div className="space-y-4">
      <div className="p-6 bg-white shadow-lg rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Activity className="w-6 h-6 text-teal-600" />
            Historial Kinesiológico
          </h2>
          <button
            className="flex items-center gap-2 px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700"
            onClick={() => handleTreatmentModal(null)}
          >
            <Plus className="w-4 h-4" />
            Nueva Evaluación
          </button>
        </div>

        {/* === Estado: CARGANDO === */}
        {isLoading && (
          <div className="flex items-center justify-center w-full p-6 text-sm text-gray-600 rounded-lg bg-gray-50">
            <div className="grid gap-2 place-items-center">
              {/* Ícono: latido suave y lento */}
              <Activity className="w-16 h-16 text-teal-500 heartbeat-slow" />

              {/* Texto con shimmer + puntitos que respiran */}
              <p className="font-medium thinking-text">
                Cargando historial
                <span className="dots" aria-hidden="true">
                  <span>·</span>
                  <span>·</span>
                  <span>·</span>
                </span>
              </p>
            </div>
          </div>
        )}

        {/* === Estado: VACÍO === */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center w-full p-8 text-center border border-gray-300 border-dashed bg-gray-50 rounded-xl">
            <div className="p-4 mb-3 bg-white rounded-full shadow-sm">
              <Activity className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">
              Sin tratamientos registrados
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Cuando registres una evaluación o sesión, aparecerá aquí.
            </p>
          </div>
        )}

        {/* === Estado: CON DATOS === */}
        {!isLoading && !isEmpty && (
          <div className="space-y-4">
            {sortedTreatments.map((t) => (
              <CardTreatment
                key={
                  t.id ?? `${t.session_type?.id ?? "st"}-${t.start_date ?? "0"}`
                }
                treatment={t}
                handleTreatmentModal={handleTreatmentModal}
              />
            ))}
          </div>
        )}
      </div>

      <SideModal
        open={openTreatmentModal}
        onClose={() => setOpenTreatmentModal(false)}
        width="5xl" // sm, md, lg, xl, 2xl, 3xl, full
      >
        <ModalCreateUpdateTreatment
          diagnostics={diagnostics}
          patient={patient}
          doctors={doctors}
          selectedTreatment={selectedTreatment}
          setOpenTreatmentModal={setOpenTreatmentModal}
        />
      </SideModal>
    </div>
  );
}
