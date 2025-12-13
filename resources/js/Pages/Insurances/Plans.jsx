import { useState } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Modal from "@/Components/Modal";
import SideModal from "@/Components/SideModal";
import TableInsurancs from "./TableInsurancs";
import ModalInsurance from "./Partials/ModalInsurance";
import ModalDeleteInsurance from "./Partials/ModalDeleteInsurance";
import { BrickWallShield, Plus } from "lucide-react";

function Plans({ plans }) {
  const [plan, setPlan] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [openModalPlan, setOpenModalPlan] = useState(false);

  const handleOpenModalDelete = (data) => {
    setPlan(data);
    setOpenModalDelete(true);
  };

  const handleOpenModalPlan = (data) => {
    setPlan(data);
    setOpenModalPlan(true);
  };

  return (
    <AuthenticatedLayout>
      <Head title="Aseguradoras" />
      <div className="p-4">
        <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <BrickWallShield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Aseguradoras</h1>
              <p className="text-sm text-gray-600">Gestión de aseguradoras</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenModalEdit(null)}
              className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 shadow-blue-500/30"
            >
              <Plus className="w-4 h-4" />
              Nueva Aseguradora
            </button>
          </div>
        </div>
        <TableInsurancs
          insurances={insurances}
          handleOpenModalEdit={handleOpenModalEdit}
          handleOpenModalDelete={handleOpenModalDelete}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={insurance ? "Editar Aseguradora" : "Nueva Aseguradora"}
        description={
          insurance
            ? "Actualizar información de la aseguradora"
            : "Crear una nueva aseguradora"
        }
        width="2xl"
      >
        <ModalInsurance insurance={insurance} setModalOpen={setModalOpen} />
      </Modal>

      <Modal
        open={openModalDelete}
        onClose={() => setOpenModalDelete(false)}
        title={"Eliminar Aseguradora"}
        description={"¿Estás seguro de eliminar esta aseguradora?"}
        maxWidth="xl"
      >
        <ModalDeleteInsurance
          insurance={insurance}
          setOpenModalDelete={setOpenModalDelete}
        />
      </Modal>
    </AuthenticatedLayout>
  );
}

export default Index;
