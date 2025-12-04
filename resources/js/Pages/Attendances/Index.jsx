import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import moment from "moment";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SideModal from "@/Components/SideModal";
import Modal from "@/Components/Modal";
import AttendancesHeader from "./Partials/AttendancesHeader";
import AttendacesTable from "./AttendacesTable";
import Kpis from "./Partials/Kpis";
import CancelModal from "./Modals/CancelModal";
import StartModal from "./Modals/StartModal";
import CompletedModal from "./Modals/CompletedModal";
import AbsentModal from "./Modals/AbsentModal";
import DteModal from "./Modals/DteModal";
import ResumeModal from "./Modals/ResumeModal";
import CreateUpdateModal from "./Modals/CreateUpdateModal";

export default function Index({
  atenciones = [],
  kpis = {},
  filtros = {},
  patients = [], // ← Agregar
  doctors = [], // ← Agregar
  session_types = [], // ← Agregar
}) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [showDTEModal, setShowDTEModal] = useState(false);
  const [showResumenModal, setShowResumenModal] = useState(false);
  const [showEditSessionModal, setShowEditSessionModal] = useState(false);
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [sessionData, setSessionData] = useState({
    session_id: "",
    treatment_id: "",
    patient_id: "",
    doctor_id: "",
    session_type_id: "",
    patient_full_name: "",
    patient_rut: "",
    patient_phone: "",
    doctor_full_name: "",
    name_session_type: "",
    session_type_base_price: 0,
    date: "",
    formated_date: "",
    time: "",
    duration: 45,
    status: "scheduled",
    patient_amount: 0,
    total_payment: 0,
    plan_session_value: 0,
    copay_clp: 0,
    consumes_plan: undefined,
    patient_plan_id: "",
    patient_plan: "" /* id, plan_name, sessions_remaining, price */,
    pain_before: 0,
    pain_after: 0,
    rom_flexion: "",
    rom_abduction: "",
    rom_rotation: "",
    techniques: [],
    exercises: [],
    notes: "",
    homework: "",
    next_goals: "",
    month_session_number: "",
    session_absent_notes: "",
    session_cancellation_notes: "",
    session_start_notes: "",
  });

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

  const openCreateSessionModal = () => {
    setSessionData([]);
    setShowCreateSessionModal(true);
  };

  // Función para abrir el modal
  const openEditSessionModal = (session) => {
    setSessionData(session);
    setShowCreateSessionModal(true);
  };

  return (
    <AuthenticatedLayout>
      <Head title="Atenciones" />
      <div className="min-h-screen p-4 bg-gray-50">
        {/* Header */}
        <AttendancesHeader openCreateSessionModal={openCreateSessionModal} />
        {/* KPIs */}
        <Kpis kpis={kpis} filtros={filtros} />

        <AttendacesTable
          atenciones={atenciones}
          filtros={filtros}
          kpis={kpis}
          openCreateSessionModal={openCreateSessionModal}
          openEditSessionModal={openEditSessionModal}
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
          title={"Modal de Marcar Ausente"}
          maxWidth="lg" // sm, md, lg, xl, 2xl, 3xl, full
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
          title={"Modal de Cancelación"}
          maxWidth="xl" // sm, md, lg, xl, 2xl, 3xl, full
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
          title={"Modal de Marcar Completado"}
          width="4xl" // sm, md, lg, xl, 2xl, 3xl, full
        >
          <CompletedModal
            sessionData={sessionData}
            setShowCompletedModal={setShowCompletedModal}
            setSessionData={setSessionData}
          />
        </SideModal>

        {/* Modal de Marcar Completado */}
        <SideModal
          open={showCreateSessionModal}
          onClose={() => setShowCreateSessionModal(false)}
          title={sessionData?.id ? "✏️ Editar Sesión" : "📋 Nueva Atención"}
          description={
            sessionData?.id
              ? `Editando sesión para ${sessionData.paciente}`
              : "Registra una nueva sesión seleccionando paciente, profesional y tipo"
          }
          width="4xl" // sm, md, lg, xl, 2xl, 3xl, full
        >
          <CreateUpdateModal
            showCreateSessionModal={showCreateSessionModal}
            setShowCreateSessionModal={setShowCreateSessionModal}
            patients={patients}
            doctors={doctors}
            session_types={session_types}
            sessionData={sessionData}
            setSessionData={setSessionData}
          />
        </SideModal>

        {/* Modal de Emitir DTE */}
        <Modal
          open={showDTEModal}
          onClose={() => setShowDTEModal(false)}
          title={"Modal de Emitir DTE"}
          maxWidth="lg" // sm, md, lg, xl, 2xl, 3xl, full
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
          title={"Modal de Emitir DTE"}
          maxWidth="lg" // sm, md, lg, xl, 2xl, 3xl, full
        >
          <ResumeModal
            sessionData={sessionData}
            setShowResumenModal={setShowResumenModal}
            openDTEModal={openDTEModal}
          />
        </Modal>

        {/* Modal Unificado de Crear/Editar Sesión */}
        <Modal
          open={showStartModal}
          onClose={() => setShowStartModal(false)}
          title={"Modal de Iniciar Sesión"}
          maxWidth="lg" // sm, md, lg, xl, 2xl, 3xl, full
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
