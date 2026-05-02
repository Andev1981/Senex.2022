import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SideModal from "@/components/SideModal";
import Modal from "@/components/Modal";
import AttendancesHeader from "@/pages/attendances/partials/attendances-header";
import AttendancesTable from "@/pages/attendances/attendances-table";
import Kpis from "@/pages/attendances/partials/kpis";
import CancelModal from "@/pages/attendances/modals/cancel-modal";
import StartModal from "@/pages/attendances/modals/start-modal";
import CompletedModal from "@/pages/attendances/modals/completed-modal";
import AbsentModal from "@/pages/attendances/modals/absent-modal";
import DteModal from "@/pages/attendances/modals/dte-modal";
import ResumeModal from "@/pages/attendances/modals/resume-modal";
import { 
  Play, 
  XCircle, 
  UserX, 
  Receipt, 
  FileText, 
  Plus 
} from "lucide-react";
import CreateUpdateModal from "@/pages/attendances/modals/create-update-modal";

export default function Index({
  atenciones = [],
  kpis = {},
  filtros = {},
  patients = [], // ← Agregar
  doctors = [], // ← Agregar
  session_types = [], // ← Agregar
  diagnostics
}) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [showDTEModal, setShowDTEModal] = useState(false);
  const [showResumenModal, setShowResumenModal] = useState(false);
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [sessionData, setSessionData] = useState({});

  useEffect(() => {
    // Revisa si viene por redirección directa para crear atención
    const searchParams = new URLSearchParams(window.location.search);
    const action = searchParams.get('action');
    const patientId = searchParams.get('patient_id');
    const doctorId = searchParams.get('doctor_id');
    const itemId = searchParams.get('item_id');

    if (action === 'create' && patientId) {
      setSessionData({ 
        patient_id: Number(patientId),
        doctor_id: doctorId ? Number(doctorId) : null,
        item_id: itemId ? Number(itemId) : null
      });
      setShowCreateSessionModal(true);
      
      // Limpia la URL para evitar que el modal se vuelva a abrir al recargar
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Acciones sobre sesiones
  const openStartModal = (session) => {
    setSessionData(session);
    setShowStartModal(true);
  };

  // Abrir modal de completado
  const openCompletedModal = (session) => {
    setSessionData(session);
    setShowCompletedModal(true);
  };

  // Abrir modal de ausente
  const openAbsentModal = (session) => {
    setSessionData(session);
    setShowAbsentModal(true);
  };

  const openCancelModal = (session) => {
    setSessionData(session);
    setShowCancelModal(true);
  };

  const openDTEModal = (session) => {
    setSessionData(session);
    setShowDTEModal(true);
  };

  const openResumenModal = (session) => {
    setSessionData(session);
    setShowResumenModal(true);
  };

  const openCreateUpdateSessionModal = (session) => {
    setSessionData(session);
    setShowCreateSessionModal(true);
  };

  return (
    <AuthenticatedLayout>
      <Head title="Atenciones" />
      <div className="min-h-screen p-4 bg-gray-50">
        {/* Header */}
        <AttendancesHeader
          openCreateUpdateSessionModal={openCreateUpdateSessionModal}
        />
        {/* KPIs */}
        <Kpis kpis={kpis} filtros={filtros} />

        <AttendancesTable
          atenciones={atenciones}
          filtros={filtros}
          kpis={kpis}
          openCreateUpdateSessionModal={openCreateUpdateSessionModal}
          openStartModal={openStartModal}
          openCompletedModal={openCompletedModal}
          openCancelModal={openCancelModal}
          openAbsentModal={openAbsentModal}
          openDTEModal={openDTEModal}
          openResumenModal={openResumenModal}
        />

        {/* Modal de Marcar Ausente */}
        <Modal
          open={showAbsentModal}
          onClose={() => setShowAbsentModal(false)}
          title="Marcar como Ausente"
          subtitle="Registro de inasistencia"
          icon={UserX}
          maxWidth="lg"
        >
          <AbsentModal
            sessionData={sessionData}
            setShowAbsentModal={setShowAbsentModal}
            setSessionData={setSessionData}
          />
        </Modal>

        {/* Modal de Cancelación */}
        <Modal
          open={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Anular Sesión"
          subtitle="Motivo de la cancelación"
          icon={XCircle}
          maxWidth="lg"
        >
          <CancelModal
            sessionData={sessionData}
            setSessionData={setSessionData}
            setShowCancelModal={setShowCancelModal}
          />
        </Modal>

        {/* Modal de Marcar Completado */}
        <SideModal
          open={showCompletedModal}
          onClose={() => setShowCompletedModal(false)}
          width="4xl" // sm, md, lg, xl, 2xl, 3xl, full
          hideDefaultHeader={true}
        >
          <CompletedModal
            sessionData={sessionData}
            setShowCompletedModal={setShowCompletedModal}
            setSessionData={setSessionData}
          />
        </SideModal>

        {/* Modal de Crear Sesión */}
        <SideModal
          open={showCreateSessionModal}
          onClose={() => setShowCreateSessionModal(false)}
          width="full" // sm, md, lg, xl, 2xl, 3xl, full
          hideDefaultHeader={true}
        >
          <CreateUpdateModal
            setShowModal={() => setShowCreateSessionModal(false)}
            patients={patients}
            doctors={doctors}
            session_types={session_types}
            sessionData={sessionData}
            setSessionData={setSessionData}
            diagnostics={diagnostics}
          />
        </SideModal>

        {/* Modal de Emitir DTE */}
        <Modal
          open={showDTEModal}
          onClose={() => setShowDTEModal(false)}
          title="Emitir Documento DTE"
          subtitle="Proceso de facturación SII"
          icon={Receipt}
          maxWidth="lg"
        >
          <DteModal
            sessionData={sessionData}
            setShowDTEModal={setShowDTEModal}
            setSessionData={setSessionData}
          />
        </Modal>

        {/* Modal de Resumen Detallado */}
        <Modal
          open={showResumenModal}
          onClose={() => setShowResumenModal(false)}
          title="Resumen de Sesión"
          subtitle="Detalles clínicos y administrativos"
          icon={FileText}
          maxWidth="lg"
        >
          <ResumeModal
            sessionData={sessionData}
            setShowResumenModal={setShowResumenModal}
            openDTEModal={openDTEModal}
          />
        </Modal>

        {/* Modal de Iniciar Sesión */}
        <Modal
          open={showStartModal}
          onClose={() => setShowStartModal(false)}
          title="Iniciar Sesión"
          subtitle="Confirmar apertura de registro"
          icon={Play}
          maxWidth="lg"
        >
          <StartModal
            sessionData={sessionData}
            setShowStartModal={setShowStartModal}
            setSessionData={setSessionData}
          />
        </Modal>
      </div>
    </AuthenticatedLayout>
  );
}
