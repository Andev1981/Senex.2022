import React, { useMemo, useState } from "react";
import { Activity, Plus, Clipboard, ClipboardList } from "lucide-react";
import TreatmentCard from "./HistorialPartials/TreatmentCard";
import ResourceFormModal from "@/Components/ResourceFormModal";
import SideModal from "@/Components/SideModal";

export default function IndexHistorial({
  patient,
  doctors,
  session_types,
  treatments = [],
}) {
  // 1) Normaliza tratamientos a array
  /* const treatments = Array.isArray(treatments)
    ? treatments
    : null; */

  // 2) Estados derivados
  const isLoading = patient == null || treatments == null; // aún no llega la data
  const isEmpty =
    !isLoading && Array.isArray(treatments) && treatments.length === 0;

  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [openTreatmentModal, setOpenTreatmentModal] = useState(false);
  const mainContact = patient?.contacts?.find((c) => c?.is_primary == true);

  const treatmentSchema = useMemo(
    () => [
      {
        name: "doctor_id",
        label: "Doctor",
        type: "select",
        searchable: true,
        options: (form) =>
          doctors.map((d) => ({
            value: d.id,
            label: d.name,
          })) /* session_types */,
        parse: (raw) => (raw ? Number(raw) : null),
        placeholder: "Seleccione kine",
        colSpan: 2,
        required: true,
      },
      {
        name: "start_date",
        label: "Fecha de inicio",
        type: "date",
        min: "2025-01-01",
        colSpan: 2,
      },

      {
        type: "switch",
        name: "is_indefinite",
        label: "Sesiones",
        placeholder: "Cantidad Indefinida",
      },
      {
        name: "total_sessions",
        label: "Total de sesiones",
        type: "number",
        visibleIf: (data) => [false].includes(data.is_indefinite),
      },
      {
        name: "frequency",
        label: "Frecuencia (Cantidad)",
        type: "number",
      },
      {
        name: "frequency_time",
        label: "Tiempo de  Frecuencia",
        type: "select",
        options: [
          { value: "day", label: "Día" },
          { value: "week", label: "Semanal" },
          { value: "month", label: "Mensual" },
        ],
      },
      {
        name: "diagnosis",
        label: "Diagnóstico",
        type: "textarea",
        placeholder: "Diagnóstico...",
        rows: 3,
        colSpan: 4,
      },
      {
        name: "description",
        label: "Descripción",
        type: "textarea",
        placeholder: "Descripción...",
        rows: 3,
        colSpan: 4,
      },
      {
        name: "objectives",
        label: "Objetivos",
        type: "textarea",
        placeholder: "Objetivos...",
        rows: 3,
        colSpan: 4,
        help: "Ingrese cada objetivo separa por una coma",
      },
      {
        type: "hidden",
        name: "is_active",
      },
      {
        type: "hidden",
        name: "patient_id",
      },
      {
        name: "session_type_id",
        type: "hidden",
      },
    ],
    [patient, mainContact]
  );

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
              <TreatmentCard
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
      {/* Modal Contacto */}
      <ResourceFormModal
        open={openTreatmentModal}
        onClose={() => setOpenTreatmentModal(false)}
        title="Evaluación / Tratamiento Kinesiológico"
        description={
          selectedTreatment?.id
            ? "Editar evaluación / tratamiento"
            : "Crear evaluación / tratamiento"
        }
        submitLabel={selectedTreatment?.id ? "Actualizar" : "Crear"}
        schema={treatmentSchema}
        submitRoute={
          selectedTreatment?.id
            ? route("patients.treatments.update", selectedTreatment?.id)
            : route("patients.treatments.store", patient.id)
        }
        method={selectedTreatment?.id ? "patch" : "post"}
        initialValues={{
          session_type_id: 1,
          patient_id: patient?.id,
          doctor_id: selectedTreatment?.doctor_id ?? null,
          diagnosis: selectedTreatment?.diagnosis ?? null,
          description: selectedTreatment?.description ?? null,
          start_date: selectedTreatment?.start_date ?? null,
          end_date: selectedTreatment?.end_date ?? null,
          status: selectedTreatment?.status ?? "evaluation",
          total_sessions: selectedTreatment?.total_sessions ?? null,
          completed_sessions: selectedTreatment?.completed_sessions ?? null,
          frequency: selectedTreatment?.frequency ?? null,
          frequency_time: selectedTreatment?.frequency_time ?? "month",
          is_indefinite: selectedTreatment?.is_indefinite ?? false,
          current_phase: selectedTreatment?.current_phase ?? null,
          objectives: Array.isArray(selectedTreatment?.objectives)
            ? (selectedTreatment?.objectives).join(", ")
            : selectedTreatment?.objectives ?? "",
          outcome: selectedTreatment?.outcome ?? null,
          next_appointment: selectedTreatment?.next_appointment ?? null,
          pain_reduction: selectedTreatment?.pain_reduction ?? null,
          mobility_improvement: selectedTreatment?.mobility_improvement ?? null,
          strength_gain: selectedTreatment?.strength_gain ?? null,
        }}
        afterSubmitReloadOnly={["patient", "selectedTreatment"]}
        columns={4}
        maxWidth={"4xl"}
        key={`cont-${selectedTreatment?.id ?? "new"}`}
      />

      {/*   <SideModal></SideModal> */}
    </div>
  );
}
