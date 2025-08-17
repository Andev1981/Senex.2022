import { useState } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TablePacientes from "./TablePacientes";
import Modal from "@/Components/Modal";
import PatientsModal from "./Partials/PatientsModal";
import PrimaryButton from "@/Components/PrimaryButton";
import PatientModalDelete from "./Partials/PatientModalDelete";
export default function PatientsIndex({ user, pacientes, comunas }) {
  const [openModalPatient, setOpenModalPatient] = useState(false);
  const [patient, setPatient] = useState(null);
  const [openModalDelete, setOpenModalDelete] = useState(false);

  const handleOpenModalOptions = (patient) => {
    setPatient(patient);
    setOpenModalPatient(true);
  };

  const handleOpenModalDelete = (patient) => {
    setPatient(patient);
    setOpenModalDelete(true);
  };

  return (
    <AuthenticatedLayout user={user}>
      <Head title="Dashboard" />
      <div className="py-6">
        <div className="mx-auto sm:px-2 lg:px-4">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <img src={"icons/usuario.gif"} className="w-10 h-10" />
                  <label className="text-lg font-semibold">Pacientes</label>
                </div>
                <PrimaryButton onClick={() => setOpenModalPatient(true)}>
                  Paciente +
                </PrimaryButton>
              </div>
              <TablePacientes
                pacientes={pacientes}
                handleOpenModalOptions={handleOpenModalOptions}
                handleOpenModalDelete={handleOpenModalDelete}
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
        <PatientsModal
          patient={patient}
          setOpenModalPatient={setOpenModalPatient}
          comunas={comunas}
        />
      </Modal>
      <Modal
        open={openModalDelete}
        onClose={() => setOpenModalDelete(false)}
        title={"Borrar Usuario"}
        description={"¿Deseas borra la sesión seleccionada?"}
        maxWidth="xl"
      >
        <PatientModalDelete
          patient={patient}
          setOpenModalDelete={setOpenModalDelete}
        />
      </Modal>
    </AuthenticatedLayout>
  );
}
