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
    <div className="space-y-8 duration-500 animate-in fade-in">
      <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 shadow-xl shadow-brand-primary/20 bg-brand-primary rounded-2xl transform rotate-3">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1 uppercase">Cronología Clínica</h1>
              <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
                Historial de Tratamientos & Evaluaciones
              </p>
            </div>
          </div>
          <button
            className="flex items-center gap-3 px-8 py-4 font-black uppercase tracking-widest text-[10px] text-white transition-all bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-95"
            onClick={() => handleTreatmentModal(null)}
          >
            <Plus className="w-4 h-4" />
            Nueva Evaluación
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* === Estado: CARGANDO === */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center w-full p-20 text-brand-gray rounded-[2rem] bg-white border border-gray-100 shadow-sm">
            <div className="w-16 h-16 border-4 border-brand-secondary/20 border-t-brand-primary rounded-full animate-spin mb-6"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Sincronizando Base de Datos...</p>
          </div>
        )}

        {/* === Estado: VACÍO === */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center w-full p-20 text-center border-2 border-gray-100 border-dashed bg-gray-50/50 rounded-[3rem]">
            <div className="p-6 mb-6 bg-white rounded-[2rem] shadow-xl text-gray-200 transform -rotate-6">
              <Activity className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">
              Sin registros clínicos
            </h3>
            <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest opacity-60 max-w-xs mx-auto">
              Inicie una nueva evaluación para comenzar a documentar el progreso del paciente.
            </p>
          </div>
        )}

        {/* === Estado: CON DATOS === */}
        {!isLoading && !isEmpty && (
          <div className="grid grid-cols-1 gap-6">
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
