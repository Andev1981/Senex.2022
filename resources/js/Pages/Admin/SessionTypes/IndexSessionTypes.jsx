import { useState } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Modal from "@/components/Modal";
import TableSessionTypes from "./TableSessionTypes";
import ModalCreateEditSessionType from "./ModalCreateEditSessionType";

export default function IndexSessionTypes({ items, filters }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSessionType, setSelectedSessionType] = useState(null);

  const handleOpenModalOptions = (sessionType) => {
    setSelectedSessionType(sessionType);
    setModalOpen(true);
  };

  const handleOpenModalDelete = (sessionType) => {
    // Logic to open delete modal
  };

  return (
    <AuthenticatedLayout>
      <Head title="Emitir Documento Tributario Electrónico" />
      <div className="p-6">
        <div className="mx-auto">
          <div className="p-6 bg-white rounded-lg shadow">
            <h1 className="mb-6 text-2xl font-bold text-gray-800">
              Tipos de Sesión
            </h1>
            <TableSessionTypes
              sessionTypes={items.data}
              handleOpenModalOptions={handleOpenModalOptions}
              handleOpenModalDelete={handleOpenModalDelete}
            />
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        description="Opciones de Tipo de Sesión"
        title={"Sesión"}
        maxWidth="4xl"
      >
        <ModalCreateEditSessionType
          sessionType={selectedSessionType}
          onClose={() => setModalOpen(false)}
        />
      </Modal>
    </AuthenticatedLayout>
  );
}
