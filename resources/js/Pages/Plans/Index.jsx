// resources/js/pages/Plans/Index.jsx
import { useState } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Modal from "@/Components/Modal";
import SideModal from "@/Components/SideModal";
import TablePlans from "./TablePlans";
import PlanModal from "./Partials/PlanModal";
import PlanModalDelete from "./Partials/PlanModalDelete";
import { Box, NotebookText, Plus } from "lucide-react";

export default function Index({ plans, insurance }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [plan, setPlan] = useState(null);
  const [openModalDelete, setOpenModalDelete] = useState(false);

  const handleOpenModalEdit = (data) => {
    setPlan(data);
    setModalOpen(true);
  };

  const handleOpenModalNew = () => {
    setPlan(null);
    setModalOpen(true);
  };

  const handleOpenModalDelete = (data) => {
    setPlan(data);
    setOpenModalDelete(true);
  };

  return (
    <AuthenticatedLayout>
      <Head title="Planes" />
      <div className="p-4">
        <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <NotebookText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Planes <span className="font-bold">{insurance?.name}</span>
              </h1>
              <p className="text-sm text-gray-600">
                Gestión de Planes para{" "}
                <span className="italic">{insurance?.name}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleOpenModalNew}
              className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 shadow-blue-500/30"
            >
              <Plus className="w-4 h-4" />
              Nuevo Plan
            </button>
          </div>
        </div>
        <TablePlans
          plans={plans}
          handleOpenModalEdit={handleOpenModalEdit}
          handleOpenModalDelete={handleOpenModalDelete}
        />
      </div>

      <SideModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={plan ? "Editar Plan" : "Nuevo Plan"}
        description={
          plan
            ? "Actualizar información del plan: " + insurance?.name
            : "Crear un nuevo plan: " + insurance?.name
        }
        width="3xl"
      >
        <PlanModal
          plan={plan}
          setModalOpen={setModalOpen}
          insurance={insurance}
        />
      </SideModal>

      <Modal
        open={openModalDelete}
        onClose={() => setOpenModalDelete(false)}
        title={"Eliminar Plan"}
        description={"¿Estás seguro de eliminar este plan?"}
        maxWidth="xl"
      >
        <PlanModalDelete plan={plan} setOpenModalDelete={setOpenModalDelete} />
      </Modal>
    </AuthenticatedLayout>
  );
}
