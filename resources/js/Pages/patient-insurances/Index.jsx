import { useState } from "react";
import { Head } from "@inertiajs/react";
import { HandshakeIcon, Plus } from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SideModal from "@/Components/SideModal";
import TablePatientsInsurances from "./TablePatientsInsurances";
import ModalPatientInsurance from "./ModalPatientInsurance";

export default function Index({ patientsInsurances, patients, plans }) {
  const [showModalCreateUpdate, setOpenModalCreateUpdate] = useState(false);
  const [patientInsuranceSelected, setPatientInsuranceSelected] =
    useState(null);
  const handleOpenModalCreateEdit = (patientInsurance) => {
    setPatientInsuranceSelected(patientInsurance);
    setOpenModalCreateUpdate(true);
  };
  const handleOpenModalDelete = () => {};

  console.log("PT: ", patientsInsurances);
  return (
    <AuthenticatedLayout>
      <Head title="Convenios Pacientes" />
      <div className="p-4">
        <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <HandshakeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Convenios</h1>
              <p className="text-sm text-gray-600">Gestión de convenios</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenModalCreateEdit(null)}
              className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 shadow-blue-500/30"
            >
              <Plus className="w-4 h-4" />
              Nuevo Convenio
            </button>
          </div>
        </div>
        <TablePatientsInsurances
          patientsInsurances={patientsInsurances}
          handleOpenModalCreateEdit={handleOpenModalCreateEdit}
          handleOpenModalDelete={handleOpenModalDelete}
        />
      </div>
      <SideModal
        open={showModalCreateUpdate}
        onClose={() => setOpenModalCreateUpdate(false)}
        title={"Asignar Convenio"}
        description={"Acá puede asignar convenios a los pacientes"}
        width="4xl"
      >
        <ModalPatientInsurance
          patientInsuranceSelected={patientInsuranceSelected}
          setOpenModalCreateUpdate={setOpenModalCreateUpdate}
          patients={patients}
          plans={plans}
        />
      </SideModal>
    </AuthenticatedLayout>
  );
}
