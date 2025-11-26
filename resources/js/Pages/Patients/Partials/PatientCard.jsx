import {
  Activity,
  Cake,
  Edit,
  FileText,
  IdCard,
  User,
  VenusAndMars,
} from "lucide-react";
import { useState } from "react";
import ModalCreateEditPatient from "./../ModalCreateEditPatient";
import SideModal from "@/Components/SideModal";
import { t } from "@/constants/translations";

export default function PatientCard({
  patient,
  communes,
  regions,
  provinces,
  address,
}) {
  const [openPatientModal, setOpenPatientModal] = useState(false);

  return (
    <div className="flex flex-col items-start justify-between w-full gap-4 md:flex-row md:items-center">
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-20 h-20 border-2 bg-white/20 backdrop-blur-sm rounded-2xl border-white/30">
          <User className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="mb-2 text-2xl font-bold">
            {patient?.name + " " + patient?.last_name}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-teal-100">
            <span className="flex items-center gap-1">
              <IdCard className="w-4 h-4" />
              RUT: {patient?.rut}
            </span>
            <span>•</span>
            <span className="flex flex-wrap text-sm text-teal-100 gap4">
              <Cake className="w-4 h-4" />
              {patient?.age} años
            </span>
            <span>•</span>
            <span className="flex flex-wrap text-sm text-teal-100 gap4">
              <VenusAndMars className="w-4 h-4" />
              {t("gender", patient?.gender)}
            </span>
            <span>•</span>
            {/* <span className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              {patient?.activity_level}
            </span> */}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setOpenPatientModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm"
        >
          <Edit className="w-4 h-4" />
          Editar
        </button>
      </div>
      {/* Modal Paciente */}
      <SideModal
        open={openPatientModal}
        onClose={() => setOpenPatientModal(false)}
        title={patient ? "Editar Paciente" : "Nuevo Paciente"}
        description={
          patient ? "Editar datos del paciente" : "Datos del nuevo paciente"
        }
        width="4xl"
      >
        <ModalCreateEditPatient
          patient={patient}
          setOpenModalPatient={setOpenPatientModal}
          communes={communes}
          regions={regions}
          provinces={provinces}
          address={address}
        />
      </SideModal>
    </div>
  );
}
