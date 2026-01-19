import { useState } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Modal from "@/components/Modal";
import SesionesModal from "./Partials/SesionesModal";
import TableSesiones from "./TableSesiones";
import TablePacientesSesion from "./TablePacientesSesion";
import SesionModalDelete from "./Partials/SesionModalDelete";

function SesionesIndex({ sesiones, kines, apply_types, pacientes }) {
  const [modalpatiensOpen, setModalSesionesOption] = useState(false);
  const [sesion, setSesion] = useState(null);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [paciente, setPaciente] = useState(null);

  const handleOpenModalOptions = (data) => {
    setPaciente(data);
    setSesion(data);
    setModalSesionesOption(true);
  };
  const handleOpenModalNewSesion = (data) => {
    setPaciente(data);
    setModalSesionesOption(true);
  };

  const handleOpenModalDelete = (data) => {
    setSesion(data);
    setOpenModalDelete(true);
  };

  return (
    <AuthenticatedLayout>
      <Head title="Sesiones Pacientes" />
      <div className="py-6">
        <div className="mx-auto sm:px-2 lg:px-4">
          <div className="overflow-hidden bg-white shadow-xl sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex items-center mb-2">
                <img src={"icons/libro-medico.gif"} className="w-10 h-10" />
                <label className="text-lg font-semibold">Sesiones</label>
              </div>
              <TableSesiones
                sesiones={sesiones}
                handleOpenModalOptions={handleOpenModalOptions}
                handleOpenModalDelete={handleOpenModalDelete}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="py-6">
        <div className="mx-auto sm:px-2 lg:px-4">
          <div className="overflow-hidden bg-white shadow-xl sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex items-center">
                <img src={"icons/lista.gif"} alt="" className="w-10 h-10" />
                <label className="text-lg font-semibold">Pacientes</label>
              </div>
              <TablePacientesSesion
                pacientes={pacientes}
                setSesion={setSesion}
                handleOpenModalNewSesion={handleOpenModalNewSesion}
              />
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={modalpatiensOpen}
        onClose={() => setModalSesionesOption(false)}
        title={"Sesión"}
        description={"Aqui puedes crear o editar una sesión"}
        maxWidth="4xl"
      >
        <SesionesModal
          sesion={sesion}
          kines={kines}
          apply_types={apply_types}
          setModalSesionesOption={setModalSesionesOption}
          paciente={paciente}
        />
      </Modal>

      <Modal
        open={openModalDelete}
        onClose={() => setOpenModalDelete(false)}
        title={"Borrar Sesión"}
        description={"¿Deseas borra la sesión seleccionada?"}
        maxWidth="xl"
      >
        <SesionModalDelete
          sesion={sesion}
          setOpenModalDelete={setOpenModalDelete}
        />
      </Modal>
    </AuthenticatedLayout>
  );
}

export default SesionesIndex;
