import React, { useEffect, useState, lazy, Suspense } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router, useRemember } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
  User,
  Activity,
  DollarSign,
  FileText,
  ChevronLeft,
  Clipboard,
  Target,
  Repeat,
} from "lucide-react";
import PatientCard from "./Partials/PatientCard";
import { PATIENT_STATUS_TRANSITIONS } from "@/utils/status";

// 👉 Lazy load por pestaña (mejor TTI)
const IndexGeneral = lazy(() => import("./General/IndexGeneral"));
const IndexHistorial = lazy(() => import("./Historial/IndexHistorial"));
const IndexTreatments = lazy(() => import("./Treatments/IndexTreatments"));
const IndexSessions = lazy(() => import("./Sessions/IndexSessions"));
const IndexExcercises = lazy(() => import("./Excercises/IndexExcercises"));
const IndexPayments = lazy(() => import("./Payments/IndexPayments"));
const IndexDocuments = lazy(() => import("./Documents/IndexDocuments"));

const canTransition = (from, to) =>
  PATIENT_STATUS_TRANSITIONS[from]?.includes(to);

/** Hook: sincroniza pestaña con ?tab= y recuerda entre visitas */
function useSyncedTab(defaultTab = "general") {
  const initial =
    new URLSearchParams(window.location.search).get("tab") || defaultTab;
  const [activeTab, setActiveTab] = useRemember(initial, "patient.activeTab");

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    sp.set("tab", activeTab);
    window.history.replaceState({}, "", `?${sp.toString()}`);
  }, [activeTab]);

  return [activeTab, setActiveTab];
}

/**
 * Componente principal: DetailPatient (refactor dinámico)
 */
export default function DetailPatient({
  patient,
  payments = [],
  sessions = [],
  session_types = [],
  treatments = [],
  treatment: defaultTreatment,
  doctors = [],
  communes = [],
  regions = [],
  provinces = [],
}) {
  const { get } = useForm();
  const [activeTab, setActiveTab] = useSyncedTab("general");

  // Modales genéricos (creación/edición)
  const [openTreatmentModal, setOpenTreatmentModal] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);

  const tabs = [
    { id: "general", label: "Información General", icon: User },
    { id: "history", label: "Historial Clínico", icon: Activity },
    { id: "treatments", label: "Tratamientos", icon: Target },
    { id: "sessions", label: "Sesiones", icon: Clipboard },
    { id: "exercises", label: "Ejercicios", icon: Repeat },
    { id: "payments", label: "Pagos", icon: DollarSign },
    { id: "documents", label: "Documentos", icon: FileText },
  ];

  const handleBack = () => {
    get(route("pacientes"));
  };

  // Helpers de recarga parcial
  const reload = (only) => router.reload({ only, preserveScroll: true });

  return (
    <AuthenticatedLayout>
      <Head title={`Paciente: ${patient.name} ${patient.last_name || ""}`} />
      <div className="min-h-screen p-4 bg-gray-100">
        {/* Header / barra superior */}
        <div className="text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl">
          <div className="px-4 py-6 mx-auto max-w-7xl">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 mb-4 text-white hover:text-teal-100"
            >
              <ChevronLeft className="w-5 h-5" /> Volver a pacientes
            </button>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <PatientCard patient={patient} />
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 mx-auto max-w-7xl">
            <div className="flex gap-2 pb-0 -mb-px overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition-all border-b-2 ${
                      isActive
                        ? "text-cyan-600 border-white bg-white rounded-t-xl"
                        : "text-teal-100 border-transparent hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contenido por pestaña */}
        <div className="py-6 mx-auto max-w-7xl">
          <Suspense fallback={<div className="p-6">Cargando…</div>}>
            {activeTab === "general" && (
              <IndexGeneral
                patient={patient}
                communes={communes}
                regions={regions}
                provinces={provinces}
              />
            )}
            {activeTab === "history" && <IndexHistorial patient={patient} />}
            {activeTab === "treatments" && (
              <IndexTreatments
                patient={patient}
                treatments={treatments}
                onCreate={() => {
                  setEditingTreatment(null);
                  setOpenTreatmentModal(true);
                }}
                onEdit={(t) => {
                  setEditingTreatment(t);
                  setOpenTreatmentModal(true);
                }}
              />
            )}

            {activeTab === "sessions" && <IndexSessions patient={patient} />}
            {activeTab === "exercises" && <IndexExcercises patient={patient} />}
            {activeTab === "payments" && <IndexPayments payments={payments} />}
            {activeTab === "documents" && <IndexDocuments patient={patient} />}
          </Suspense>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

/* function MiniStat({ label, value, tone = 0 }) {
  const color =
    tone >= 7
      ? "text-red-600"
      : tone >= 4
      ? "text-orange-600"
      : "text-green-600";
  return (
    <div className="p-3 bg-white rounded-lg">
      <p className="mb-1 text-xs text-gray-600">{label}</p>
      <p className={`text-2xl font-bold ${tone ? color : "text-teal-600"}`}>
        {value}
      </p>
    </div>
  );
}
function ROMItem({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-xs text-gray-600">{label}</p>
      <p className="font-bold text-gray-900">{value}°</p>
    </div>
  );
}
function TagGroup({ title, items, color = "teal" }) {
  const tone =
    color === "purple"
      ? "text-purple-700 bg-purple-100"
      : "text-teal-700 bg-teal-100";
  return (
    <div className="mb-4">
      <h4 className="mb-2 text-sm font-semibold text-gray-900">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className={`px-3 py-1 text-xs rounded-full ${tone}`}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
function Callout({ title, text, tone = "blue" }) {
  const map = {
    blue: "border-blue-500 bg-blue-50",
    yellow: "border-yellow-500 bg-yellow-50",
  };
  return (
    <div className={`p-3 mb-3 border-l-4 rounded-lg ${map[tone]}`}>
      <h4 className="mb-1 text-sm font-semibold text-gray-900">{title}</h4>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  );
} */
