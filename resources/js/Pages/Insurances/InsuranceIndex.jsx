import { useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Plus, BrickWallShield } from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Modal from "@/components/Modal";
import SideModal from "@/components/SideModal";
import TableInsurances from "./Partials/TableInsurances";
import InsuranceFormModal from "./Partials/InsuranceFormModal";
import InsuranceTariff from "./Partials/InsuranceTariff";

const InsuranceIndex = ({ insurances, sessionTypes, user }) => {
  const addButtonRef = useRef(null);
  
  // 1. Estado para el Modal de Edición/Creación de Aseguradora
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(null);

  // 2. Estado para el Modal de Tarifario & Coberturas
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);

  // Funciones para el Modal de Edición de Aseguradora
  const openFormModal = (insurance = null) => {
    setEditingInsurance(insurance);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setEditingInsurance(null);
    setIsFormModalOpen(false);
  };

  // Funciones para el Tarifario
  const openTariffModal = (insurance) => {
    setEditingInsurance(insurance);
    setIsTariffModalOpen(true);
  };

  const closeTariffModal = () => {
    setEditingInsurance(null);
    setIsTariffModalOpen(false);
    router.reload({ only: ["insurances"] });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Gestión de Aseguradoras & Tarifarios" />
      <div className="min-h-screen p-6 bg-gray-50/50 space-y-8">
        {/* Header Premium */}
        <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 shadow-xl shadow-brand-primary/20 bg-brand-primary rounded-2xl transform rotate-3">
                <BrickWallShield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">Aseguradoras & Isapres</h1>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
                  Maestro de Previsión & Tarifas de Convenio
                </p>
              </div>
            </div>
            <button
              onClick={() => openFormModal()}
              className="flex items-center gap-3 px-8 py-4 font-black uppercase tracking-widest text-[10px] text-white transition-all bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nueva Aseguradora
            </button>
          </div>
        </div>
        
        <TableInsurances
          insurances={insurances}
          handleOpenModalEdit={openFormModal}
          openPlanListModal={openTariffModal} 
          user={user}
        />
      </div>

      {/* Modal de Tarifario Integrado */}
      <SideModal
        open={isTariffModalOpen}
        onClose={closeTariffModal}
        width="6xl"
      >
        <InsuranceTariff
          insurance={editingInsurance}
          plans={editingInsurance?.plans || []}
          sessionTypes={sessionTypes}
          onClose={closeTariffModal}
        />
      </SideModal>

      {/* Modal de Registro de Aseguradora */}
      <Modal
        open={isFormModalOpen}
        onClose={closeFormModal}
        maxWidth="3xl"
      >
        <InsuranceFormModal
          onClose={closeFormModal}
          insurance={editingInsurance}
          sessionTypes={sessionTypes}
        />
      </Modal>
    </AuthenticatedLayout>
  );
};

export default InsuranceIndex;
