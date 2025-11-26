import { useState } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Modal from "@/Components/Modal";
import SideModal from "@/Components/SideModal";
import TableInsuranceCompanies from "./TableInsuranceCompanies";
import InsuranceCompanyModal from "./Partials/InsuranceCompanyModal";
import InsuranceCompanyModalDelete from "./Partials/InsuranceCompanyModalDelete";
import { BrickWallShield, Plus } from "lucide-react";

function Index({ insuranceCompanies }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [insuranceCompany, setInsuranceCompany] = useState(null);
  const [openModalDelete, setOpenModalDelete] = useState(false);

  const handleOpenModalEdit = (data) => {
    setInsuranceCompany(data);
    setModalOpen(true);
  };

  const handleOpenModalNew = () => {
    setInsuranceCompany(null);
    setModalOpen(true);
  };

  const handleOpenModalDelete = (data) => {
    setInsuranceCompany(data);
    setOpenModalDelete(true);
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
              onClick={() => alert("Nuevo paciente")}
              className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 shadow-blue-500/30"
            >
              <Plus className="w-4 h-4" />
              Nueva Aseguradora
            </button>
          </div>
        </div>
        <TableInsuranceCompanies
          insuranceCompanies={insuranceCompanies}
          handleOpenModalEdit={handleOpenModalEdit}
          handleOpenModalDelete={handleOpenModalDelete}
        />
      </div>

      <SideModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={insuranceCompany ? "Editar Aseguradora" : "Nueva Aseguradora"}
        description={
          insuranceCompany
            ? "Actualizar información de la aseguradora"
            : "Crear una nueva aseguradora"
        }
        width="2xl"
      >
        <InsuranceCompanyModal
          insuranceCompany={insuranceCompany}
          setModalOpen={setModalOpen}
        />
      </SideModal>

      <Modal
        open={openModalDelete}
        onClose={() => setOpenModalDelete(false)}
        title={"Eliminar Aseguradora"}
        description={"¿Estás seguro de eliminar esta aseguradora?"}
        maxWidth="xl"
      >
        <InsuranceCompanyModalDelete
          insuranceCompany={insuranceCompany}
          setOpenModalDelete={setOpenModalDelete}
        />
      </Modal>
    </AuthenticatedLayout>
  );
}

export default Index;
