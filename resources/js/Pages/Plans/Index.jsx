// resources/js/pages/Plans/Index.jsx
import { useState } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Modal from "@/components/Modal";
import SideModal from "@/components/SideModal";
import TablePlans from "./TablePlans";
import PlanForm from "./Partials/PlanForm";
import PlanModalDelete from "./Partials/PlanModalDelete";
import { Box, NotebookText, Plus } from "lucide-react";

export default function Index({ plans, insurance, sessionTypes }) {
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
      <Head title="Packs y Programas Comerciales" />
      
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header Premium */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-[3rem] p-4 mb-10">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 px-6 py-4">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-primary/30">
                  <Box className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                    Packs & Programas
                  </h1>
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mt-1 opacity-70">
                    Gestión de productos comerciales y paquetes de sesiones
                  </p>
                </div>
              </div>
              
              <button 
                onClick={handleOpenModalNew}
                className="flex items-center gap-3 px-10 py-5 bg-gray-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.1em] hover:bg-black hover:scale-105 transition-all shadow-xl shadow-gray-200"
              >
                <Plus className="w-5 h-5" />
                Nuevo Pack Comercial
              </button>
            </div>
          </div>

          <TablePlans
            plans={plans}
            handleOpenModalEdit={handleOpenModalEdit}
            handleOpenModalDelete={handleOpenModalDelete}
          />
        </div>
      </div>

      <SideModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        width="4xl"
      >
        <PlanForm
          plan={plan}
          onClose={() => setModalOpen(false)}
          insurance={insurance}
          sessionTypes={sessionTypes}
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
