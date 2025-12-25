import { useEffect, lazy, Suspense } from "react";
import { Head, useRemember } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PatientSidebar from "./Partials/PatientSidebar"; // <--- Importamos el nuevo Sidebar

// Lazy components (Mantenemos los que ya tenías)
const IndexGeneral = lazy(() => import("./General/IndexGeneral"));
const IndexHistorial = lazy(() => import("./Historial/IndexHistorial"));
const IndexTreatments = lazy(() => import("./Treatments/IndexTreatments"));
const IndexPayments = lazy(() => import("./Payments/IndexPayments"));
const PatientDashboard = lazy(() => import("./Dashboard/PatientDashboard")); // <--- El Dashboard nuevo que hicimos ayer

function useSyncedTab(defaultTab = "dashboard") {
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

export default function DetailPatient(props) {
  const [activeTab, setActiveTab] = useSyncedTab("dashboard");
  const { patient } = props;

  return (
    <AuthenticatedLayout>
      <Head title={`${patient.name} - Ficha Clínica`} />

      <div className="flex min-h-screen bg-gray-50">
        {/* 1. COLUMNA IZQUIERDA (Sidebar Fijo) */}
        <PatientSidebar
          patient={patient}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* 2. COLUMNA DERECHA (Contenido Dinámico) */}
        {/* Agregamos ml-80 para dejar espacio al sidebar fixed de ancho 80 (20rem) */}
        <main className="flex-1 p-8 ml-0 transition-all md:ml-80">
          {/* Título de la sección actual (Opcional, para contexto) */}
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === "dashboard" && "Resumen del Paciente"}
              {activeTab === "general" && "Información Completa"}
              {activeTab === "history" && "Historial Clínico"}
              {activeTab === "payments" && "Gestión Financiera"}
            </h1>
          </header>

          {/* Área de Contenido con Suspense */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px] p-6">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-64 text-gray-400">
                  Cargando módulo...
                </div>
              }
            >
              {activeTab === "dashboard" && <PatientDashboard {...props} />}
              {activeTab === "general" && <IndexGeneral {...props} />}
              {activeTab === "history" && <IndexHistorial {...props} />}
              {activeTab === "treatments" && (
                <IndexTreatments {...props} />
              )}{" "}
              {/* Quizás quieras fusionar esto con history */}
              {activeTab === "payments" && <IndexPayments {...props} />}
            </Suspense>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
