import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Modal from "@/components/Modal";
import TableHealthInsurers from "./TableHealthInsurers";
import HealthInsurerModal from "./Partials/HealthInsurerModal";
import HealthInsurerModalDelete from "./Partials/HealthInsurerModalDelete";
import SideModal from "@/components/SideModal";
import { Plus, Activity, HeartPulse } from "lucide-react";

export default function Index({ healthInsurers }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [healthInsurer, setHealthInsurer] = useState(null);
  const [openModalDelete, setOpenModalDelete] = useState(false);

  const handleOpenModalEdit = (data) => {
    setHealthInsurer(data);
    setModalOpen(true);
  };

  const handleOpenModalNew = () => {
    setHealthInsurer(null);
    setModalOpen(true);
  };

  const handleOpenModalDelete = (data) => {
    setHealthInsurer(data);
    setOpenModalDelete(true);
  };

  return (
    <AuthenticatedLayout>
      <Head title="Isapres" />
      <div className="p-4">
        <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Isapres</h1>
              <p className="text-sm text-gray-600">Gestión de isapres</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => alert("Nuevo paciente")}
              className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 shadow-blue-500/30"
            >
              <Plus className="w-4 h-4" />
              Nueva Isapre
            </button>
          </div>
        </div>

        <TableHealthInsurers
          healthInsurers={healthInsurers}
          handleOpenModalEdit={handleOpenModalEdit}
          handleOpenModalDelete={handleOpenModalDelete}
        />
      </div>

      <SideModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={healthInsurer ? "Editar Isapre" : "Nueva Isapre"}
        description={
          healthInsurer
            ? "Actualizar Información de Isapre"
            : "Crear Nueva Isapre"
        }
        width="2xl"
      >
        <HealthInsurerModal
          healthInsurer={healthInsurer}
          setModalOpen={setModalOpen}
        />
      </SideModal>

      <Modal
        open={openModalDelete}
        onClose={() => setOpenModalDelete(false)}
        title={"Eliminar Isapre"}
        description={"¿Seguro que desea borrar esta Isapre?"}
        maxWidth="xl"
      >
        <HealthInsurerModalDelete
          healthInsurer={healthInsurer}
          setOpenModalDelete={setOpenModalDelete}
        />
      </Modal>
    </AuthenticatedLayout>
  );
}
