import { useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Plus, BrickWallShield } from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Modal from "@/Components/Modal";
import SideModal from "@/Components/SideModal";
import TableInsurances from "./Partials/TableInsurances";
import PlanEditForm from "./Partials/PlanEditForm";
import InsuranceFormModal from "./Partials/InsuranceFormModal";
import TablePlans from "./Partials/TablePlans";

// --- 2. MODAL DE GESTIÓN DE PLANES (LANZADO DESDE LA TABLA) ---

// --- COMPONENTE PRINCIPAL ---

const InsuranceIndex = ({ insurances, sessionTypes }) => {
  const addButtonRef = useRef(null);
  // 1. Estado para el Modal de Edición/Creación de Aseguradora
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(null);

  // 2. Estado para el Modal de Gestión de Planes
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [isPlansModalListOpen, setIsPlansModalListOpen] = useState(false);
  const [insuracePlans, setInsuracePlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null); // La Insurance cuyo plan estamos gestionando

  // Funciones para el Modal de Edición de Aseguradora
  const openFormModal = (insurance = null) => {
    setEditingInsurance(insurance);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setEditingInsurance(null);
    setIsFormModalOpen(false);
    router.reload({ only: ["insurances"] });
  };

  // Funciones para el Modal de Gestión de Planes
  const openPlanFormModal = (plan) => {
    setEditingPlan(plan);
    setIsPlansModalOpen(true);
    setIsPlansModalListOpen(false);
  };
  const closePlansFormModal = () => {
    setEditingInsurance(null);
    setIsPlansModalOpen(false);
    router.reload({ only: ["insurances"] });
  };

  const openPlanListModal = (data) => {
    setEditingInsurance(data);
    setInsuracePlans(data?.plans);
    setIsPlansModalListOpen(true);
  };

  const closePlanListModal = () => {
    setEditingInsurance(null);
    setInsuracePlans([]);
    setIsPlansModalListOpen(false);
    router.reload({ only: ["insurances"] });
  };

  const handleOpenModalPlanDelete = () => {};

  return (
    <AuthenticatedLayout>
      <Head title="Gestión de Aseguradoras y Planes" />
      <div className="p-4">
        <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <BrickWallShield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Aseguradoras / Isapres
              </h1>
              <p className="text-sm text-gray-600">
                Gestión de aseguradoras / Isapres
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              ref={addButtonRef}
              onClick={() => openFormModal()}
              className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 shadow-blue-500/30"
            >
              <Plus className="w-4 h-4" />
              Nueva Aseguradora
            </button>
          </div>
        </div>
        <TableInsurances
          insurances={insurances}
          handleOpenModalEdit={openFormModal}
          handleOpenModalDelete={() => {}}
          openPlanListModal={openPlanListModal}
        />
      </div>

      {/* Modal de Gestión de Planes */}
      <SideModal
        open={isPlansModalListOpen}
        onClose={closePlanListModal}
        title={editingInsurance && "Planes: " + editingInsurance?.name}
        description="Asigne los montos y vigencia para la prestación seleccionada."
        width="5xl"
      >
        <TablePlans
          plans={insuracePlans}
          insurance={editingInsurance}
          handleOpenModalPlanEdit={openPlanFormModal}
          handleOpenModalPlanDelete={handleOpenModalPlanDelete}
        />
      </SideModal>
      {/* Modal de Edición/Creación de Aseguradora (Ahora solo para la entidad padre) */}
      <Modal
        open={isFormModalOpen}
        onClose={closeFormModal}
        title={editingInsurance ? "Actualizando datos" : "Creando nuevos datos"}
        description="Edite/Cree los datos principales de la Isapre/Aseguradora."
        width="3xl"
      >
        <InsuranceFormModal
          onClose={closeFormModal}
          insurance={editingInsurance}
          sessionTypes={sessionTypes}
        />
      </Modal>

      {/* Modal de Gestión de Planes */}
      <SideModal
        open={isPlansModalOpen}
        onClose={closePlansFormModal}
        title={editingInsurance && "Planes: " + editingInsurance?.name}
        description="Asigne los montos y vigencia para la prestación seleccionada."
        width="4xl"
      >
        <PlanEditForm
          editingInsurance={editingInsurance}
          plan={editingPlan}
          sessionTypes={sessionTypes}
        />
      </SideModal>
    </AuthenticatedLayout>
  );
};

// En PlansListModal.jsx (definición del componente interno)

// Definición del componente interno PlanEditForm (dentro de PlansListModal.jsx)

export default InsuranceIndex;
