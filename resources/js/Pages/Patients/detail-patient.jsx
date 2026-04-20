import { useEffect, lazy, Suspense, useState } from "react";
import { Head, useRemember, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import PatientSidebar from "./partials/patient-sidebar"; 
import Modal from "@/components/Modal";
import SideModal from "@/components/SideModal";
import SessionFormModal from "../attendances/modals/create-update-modal";
import { Plus, ArrowLeft } from "lucide-react";
import PatientHistoryTable from '@/components/PatientHistoryTable';
import ModalCreateEditPatient from "./modal-create-edit-patient";

// Lazy components
const IndexGeneral = lazy(() => import("./general/index-general"));
const IndexHistorial = lazy(() => import("./historial/index-historial"));
const IndexTreatments = lazy(() => import("./treatments/index-treatments"));
const IndexPayments = lazy(() => import("./payments/index-payments"));
const PatientDashboard = lazy(() => import("./dashboard/patient-dashboard"));
const IndexPlans = lazy(() => import("./plans/index")); // Importar el nuevo componente IndexPlans

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
  const { 
    patient, 
    doctors, 
    session_types, 
    communes, 
    regions, 
    provinces, 
    diagnostics, 
    history, 
    treatments, 
    active_treatments, // <--- Agregar esta línea
    sessions  
  } = props;
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);

  return (
    <AuthenticatedLayout>
      <Head title={`${patient.name} - Ficha Clínica`} />

      <div className="flex flex-col xl:flex-row min-h-screen bg-gray-50/50">
        {/* 1. COLUMNA IZQUIERDA (Sidebar Anidado) */}
        <div className="xl:w-64 w-full flex-none">
            <PatientSidebar
            patient={patient}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleEditPatient={() => setShowEditPatientModal(true)}
            />
        </div>

        {/* 2. COLUMNA DERECHA (Contenido Dinámico) */}
        <main className="flex-1 p-4 transition-all">
          {/* Título de la sección actual (Diseño Enterprise) */}
          <header className="mb-4 p-8 rounded-2xl flex shadow-xl flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1 uppercase">
                {activeTab === "dashboard" && "Dashboard Clínico"}
                {activeTab === "general" && "Expediente del Paciente"}
                {activeTab === "history" && "Historial de Atenciones"}
                {activeTab === "payments" && "Balance & Transacciones"}
                {activeTab === "treatments" && "Planes de Tratamiento"}
                {activeTab === "plans" && "Planes Contratados"} {/* Nuevo título para la pestaña de planes */}
                </h1>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] mt-2">Ficha Digital • ID {patient.id}</p>
            </div>
            
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setShowSessionModal(true)}
                    className="group flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-brand-primary/20 transition-all active:scale-95 cursor-pointer"
                >
                    <div className="bg-white/20 rounded-full p-0.5 group-hover:rotate-90 transition-transform">
                        <Plus className="w-3 h-3" />
                    </div>
                    Registrar Atención
                </button>
                <Link
                    href={route("patients.index")}
                    className="px-6 py-3 bg-white border border-gray-100 text-brand-gray rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-brand-primary transition-all shadow-sm flex items-center gap-2 w-fit cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" /> Directorio
                </Link>
            </div>
          </header>

          {/* Área de Contenido con Suspense (Estilo Carpeta Premium) */}
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 min-h-[600px] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
            
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center h-96 text-brand-gray">
                  <div className="w-12 h-12 border-4 border-brand-secondary/20 border-t-brand-primary rounded-full animate-spin mb-4"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Sincronizando Módulo...</p>
                </div>
              }
            >
              <div className="relative z-10">
                {activeTab === "dashboard" && (
                    <PatientDashboard 
                        {...props} 
                        openSessionModal={() => setShowSessionModal(true)} 
                    />
                )}
                {activeTab === "general" && <IndexGeneral {...props} />}
                {activeTab === "history" && <IndexHistorial {...props} treatments={active_treatments || []} />}
                {activeTab === "treatments" && (
                    <IndexTreatments 
                        {...props} 
                        treatments={treatments || []}
                        sessions={(treatments || []).flatMap(t => t.sessions || [])}
                    />
                )}
                {activeTab === "plans" && <IndexPlans {...props} patient={patient} />} {/* Nuevo caso para la pestaña de planes */}
                {activeTab === "payments" && <IndexPayments {...props} />}
              </div>
            </Suspense>
          </div>
        </main>
      </div>

      <SideModal
        open={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        width="full"
      >
        <SessionFormModal
          setShowModal={setShowSessionModal}
          preselectedPatient={patient}
          doctors={doctors}
          session_types={session_types}
          diagnostics={diagnostics}
        />
      </SideModal>

      <SideModal
        open={showEditPatientModal}
        onClose={() => setShowEditPatientModal(false)}
        width="5xl"
      >
        <ModalCreateEditPatient
          patient={patient}
          setOpenModalPatient={setShowEditPatientModal}
          communes={communes}
          regions={regions}
          provinces={provinces}
        />
      </SideModal>
    </AuthenticatedLayout>
  );
}