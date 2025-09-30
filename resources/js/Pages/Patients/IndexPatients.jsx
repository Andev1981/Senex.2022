import { useState } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TablePatients from "./TablePatients";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import ModalCreateEditPatient from "./ModalCreateEditPatient";
import ModalDeletePatient from "./ModalDeletePatient";

export default function IndexPatients({
  patients,
  communes,
  regions,
  provinces,
}) {
  const [openModalPatient, setOpenModalPatient] = useState(false);
  const [patient, setPatient] = useState({});
  const [openModalDelete, setOpenModalDelete] = useState(false);

  const handleOpenModalDelete = (data) => {
    setPatient(data);
    setOpenModalDelete(true);
  };

  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />
      <div className="py-6">
        <div className="mx-auto sm:px-2 lg:px-4">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <img
                    src={"/icons/resolucion-de-problemas.gif"}
                    className="w-10 h-10"
                  />

                  <label className="text-lg font-semibold">Pacientes</label>
                </div>
                <PrimaryButton
                  onClick={() => {
                    setPatient(null), setOpenModalPatient(true);
                  }}
                >
                  Paciente +
                </PrimaryButton>
              </div>
              <TablePatients
                patients={patients}
                handleOpenModalDelete={handleOpenModalDelete}
                communes={communes}
              />
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={openModalPatient}
        onClose={() => setOpenModalPatient(false)}
        title={"Usuario"}
        description={"Aqui puedes crear o editar un usuario"}
        maxWidth="4xl"
      >
        <ModalCreateEditPatient
          patient={patient}
          setOpenModalPatient={setOpenModalPatient}
          communes={communes}
          regions={regions}
          provinces={provinces}
        />
      </Modal>
      <Modal
        open={openModalDelete}
        onClose={() => setOpenModalDelete(false)}
        title={"Borrar Usuario"}
        description={"¿Deseas borra la sesión seleccionada?"}
        maxWidth="xl"
      >
        <ModalDeletePatient
          patient={patient}
          setOpenModalDelete={setOpenModalDelete}
        />
      </Modal>
    </AuthenticatedLayout>
  );
}
