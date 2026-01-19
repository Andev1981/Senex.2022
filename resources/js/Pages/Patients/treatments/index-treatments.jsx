import { useState, useEffect } from "react";
import { Clipboard, Plus, Target } from "lucide-react";
import SideModal from "@/components/SideModal";
import Modal from "@/components/Modal";
import TreatmentCardMain from "./treatment-partials/treatment-card-main";
import TreatmentModal from "./treatment-partials/treatment-modal";
import IndexSessions from "./sessions/index-sessions";
import SessionFormModal from "@/pages/attendances/modals/create-update-modal"; // Modal Definitivo
import SessionModalDelete from "./sessions/session-modal-delete";

export default function IndexTreatments({
  patient,
  session_types,
  treatments,
  sessions,
  doctors,
  diagnostics
}) {
  const isLoading = patient == null || treatments == null; // aún no llega la data
  const isEmpty =
    !isLoading && Array.isArray(treatments) && treatments.length === 0;

  const [openTreatmentModal, setOpenTreatmentModal] = useState(false);
  
  // Lógica de selección inicial (extraída para reutilizar)
  const getInitialTreatment = (list) => {
      if (!list || list.length === 0) return null;
      
      const inProgress = list.find((t) => t.status === "in_progress");
      if (inProgress) return inProgress;

      return [...list].sort(
        (a, b) => new Date(b.start_date) - new Date(a.start_date)
      )[0];
  };

  const [selectedTreatment, setSelectedTreatmentModal] = useState(() => getInitialTreatment(treatments));

  // Sincronizar selección cuando llegan nuevos tratamientos
  useEffect(() => {
      // Solo actualizar si no hay selección actual o si la lista cambió significativamente
      // Para simplicidad, si el tratamiento seleccionado ya no existe en la lista o si la lista se cargó recién
      if (!selectedTreatment || (Array.isArray(treatments) && !treatments.find(t => t.id === selectedTreatment.id))) {
          setSelectedTreatmentModal(getInitialTreatment(treatments));
      }
      // Opcional: Si quieres que SIEMPRE salte al más nuevo al crear uno:
      // setSelectedTreatmentModal(getInitialTreatment(treatments));
  }, [treatments]);

  const [openSessionModalShow, setOpenSessionModalShow] = useState(false);
  const [openSessionModal, setOpenSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState([]);

  const [isDuplicate, setIsDuplicate] = useState(false);

  const handleTreatmentModal = (treatment) => {
    // Aquí iría la lógica para abrir el modal de tratamiento
    setIsDuplicate(false);
    if (treatment) {
      setSelectedTreatmentModal(treatment);
    } else {
      setSelectedTreatmentModal([]);
    }
    setOpenTreatmentModal(true);
  };

  const handleOpenModalSession = (session, treatment) => {
    // Aquí iría la lógica para abrir el modal de sesión
    if (treatment) {
      setSelectedTreatmentModal(treatment);
    } else {
      setSelectedTreatmentModal([]);
    }

    if (session) {
      setSelectedSession(session);
    } else {
      setSelectedSession([]);
    }
    setOpenSessionModal(true);
  };

  const handleOpenModalSessionShow = (session) => {
    // Aquí iría la lógica para abrir el modal de sesión

    if (session) {
      setSelectedSession(session);
    } else {
      setSelectedSession([]);
    }
    setOpenSessionModalShow(true);
  };

  return (
    <div className="space-y-4">
      {/* === Estado: CARGANDO === */}
      {isLoading && (
        <div className="flex items-center justify-center w-full p-6 text-sm text-gray-600 rounded-lg bg-gray-50">
          <div className="grid gap-2 place-items-center">
            {/* Ícono: latido suave y lento */}
            <Target className="w-16 h-16 text-teal-500 heartbeat-slow" />

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
        <EmptyData
          handleOpenModalSession={handleOpenModalSession}
          treatment={selectedTreatment ? selectedTreatment : []}
        />
      )}

      {/* === Estado: CON DATOS === */}
      {!isLoading && !isEmpty && (
        <div>
          <div className="grid grid-cols-4 gap-4">
            <TreatmentCardMain
              treatment={selectedTreatment}
              handleTreatmentModal={handleTreatmentModal}
            />
            <div className="col-span-3">
              {selectedTreatment !== null ? (
                <IndexSessions
                  sessions={sessions.filter(
                    (s) => s.treatment_id === selectedTreatment.id
                  )}
                  handleOpenModalSession={handleOpenModalSession}
                  handleOpenModalSessionShow={handleOpenModalSessionShow}
                  treatment={selectedTreatment}
                  setIsDuplicate={setIsDuplicate}
                />
              ) : (
                <EmptyData
                  handleOpenModalSession={handleOpenModalSession}
                  treatment={selectedTreatment ? selectedTreatment : []}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <SideModal
        open={openTreatmentModal}
        onClose={() => setOpenTreatmentModal(false)}
        width="3xl" // sm, md, lg, xl, 2xl, 3xl, full
        hideDefaultHeader={true}
      >
        <TreatmentModal
          treatments={treatments}
          handleTreatmentModal={handleTreatmentModal}
          setOpenTreatmentModal={setOpenTreatmentModal}
          diagnostics={diagnostics}
        />
      </SideModal>

      <SideModal
        open={openSessionModal}
        onClose={() => setOpenSessionModal(false)}
        width="full" // Full width para el BodySelector
      >
        <SessionFormModal
          setShowModal={setOpenSessionModal}
          // Si hay sesión seleccionada con ID, es edición. 
          // Si no, es creación, y pasamos el treatment_id para que el select venga pre-marcado.
          sessionData={
            selectedSession?.id 
                ? selectedSession 
                : { treatment_id: selectedTreatment?.id }
          }
          preselectedPatient={patient}
          doctors={doctors}
          session_types={session_types}
          diagnostics={diagnostics}
          isDuplicate={isDuplicate}
        />
      </SideModal>

      <Modal
        open={openSessionModalShow}
        onClose={() => setOpenSessionModalShow(false)}
        title={"Eliminar Sesión"}
        maxWidth="2xl" // sm, md, lg, xl, 2xl, 3xl, full
      >
        <SessionModalDelete
          session={selectedSession}
          setOpenSessionModalShow={setOpenSessionModalShow}
        />
      </Modal>
    </div>
  );
}

const EmptyData = ({ handleOpenModalSession, treatment }) => {
  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Clipboard className="w-6 h-6 text-teal-600" /> Sesiones
        </h2>
        {treatment.length > 0 && (
          <button
            onClick={() => handleOpenModalSession([], treatment)}
            className="flex items-center gap-2 px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700"
          >
            <Plus className="w-4 h-4" /> Registrar Sesión
          </button>
        )}
      </div>
      <div className="flex flex-col items-center justify-center w-full p-8 text-center border border-gray-300 border-dashed bg-gray-50 rounded-xl">
        <div className="p-4 mb-3 bg-white rounded-full shadow-sm">
          <Target className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700">
          Sin tratamientos registrados
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Cuando registres una evaluación o sesión, aparecerá aquí.
        </p>
      </div>
    </div>
  );
};
