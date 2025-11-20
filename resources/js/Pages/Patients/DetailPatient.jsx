import { useEffect, lazy, Suspense } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router, useRemember } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
  User,
  Activity,
  DollarSign,
  FileText,
  ChevronLeft,
  Target,
  Repeat,
} from "lucide-react";
import PatientCard from "./Partials/PatientCard";

// 👉 Lazy load por pestaña (mejor TTI)
const IndexGeneral = lazy(() => import("./General/IndexGeneral"));
const IndexHistorial = lazy(() => import("./Historial/IndexHistorial"));
const IndexTreatments = lazy(() => import("./Treatments/IndexTreatments"));
const IndexExcercises = lazy(() => import("./Excercises/IndexExcercises"));
const IndexPayments = lazy(() => import("./Payments/IndexPayments"));
/* const IndexDocuments = lazy(() => import("./Documents/IndexDocuments")); */

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
  debts = [],
  session_types = [],
  doctors = [],
  communes = [],
  regions = [],
  provinces = [],
  treatments,
  address,
  vital,
}) {
  const { get } = useForm();
  const [activeTab, setActiveTab] = useSyncedTab("general");

  const tabs = [
    { id: "general", label: "Información General", icon: User },
    { id: "history", label: "Historial Clínico", icon: Activity },
    { id: "treatments", label: "Tratamientos / Sesiones", icon: Target },
    { id: "payments", label: "Pagos", icon: DollarSign },
    /* { id: "exercises", label: "Ejercicios", icon: Repeat }, */
    /* { id: "documents", label: "Documentos", icon: FileText }, */
  ];

  const handleBack = () => {
    get(route("patients.index"));
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Paciente: ${patient.name} ${patient.last_name || ""}`} />
      <div className="min-h-screen p-4 bg-gray-100">
        {/* Header / barra superior */}
        <div className="text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl">
          <div className="px-4 py-6 mx-auto">
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
          <div className="px-4 mx-auto">
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
        <div className="py-6 mx-auto">
          <Suspense fallback={<div className="p-6">Cargando…</div>}>
            {activeTab === "general" && (
              <IndexGeneral
                patient={patient}
                communes={communes}
                regions={regions}
                provinces={provinces}
                address={address}
                vital={vital}
              />
            )}
            {activeTab === "history" && (
              <IndexHistorial
                patient={patient}
                doctors={doctors}
                session_types={session_types}
                treatments={treatments}
              />
            )}
            {activeTab === "treatments" && (
              <IndexTreatments
                patient={patient}
                session_types={session_types}
                treatments={treatments}
                doctors={doctors}
                sessions={sessions}
              />
            )}
            {/*  {activeTab === "exercises" && <IndexExcercises patient={patient} />} */}
            {activeTab === "payments" && (
              <IndexPayments
                payments={payments}
                sessions={sessions}
                patient={patient}
              />
            )}
            {activeTab === "documents" && <IndexDocuments patient={patient} />}
          </Suspense>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
