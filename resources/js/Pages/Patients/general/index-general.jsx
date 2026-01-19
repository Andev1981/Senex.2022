import React, { useState } from "react";
import PatientData from "./general-partials/patient-data";
import Vital from "./general-partials/vital";
import EmergencyContact from "./general-partials/emergency-contact";
import PatientAddress from "./general-partials/patient-address";
import ModalCreateEditPatient from "../modal-create-edit-patient";
import Modal from "@/components/Modal";
import { UserCog, ShieldCheck, Database } from "lucide-react";

export default function IndexGeneral({
  patient,
  communes,
  regions,
  provinces,
  address,
  vital,
  contact,
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="space-y-8 duration-500 animate-in fade-in">
      {/* BOTÓN DE EDICIÓN MAESTRA */}
      <div className="flex justify-end px-2">
        <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 group"
        >
            <UserCog className="w-4 h-4 text-brand-secondary group-hover:rotate-12 transition-transform" />
            Actualizar Perfil Maestro
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <PatientData
            patient={patient}
            communes={communes}
            regions={regions}
            provinces={provinces}
          />
          <PatientAddress
            patient={patient}
            communes={communes}
            regions={regions}
            provinces={provinces}
            address={address}
          />
          <EmergencyContact patient={patient} contact={contact} />
        </div>
        <div className="space-y-8">
          <Vital patient={patient} vital={vital} />
        </div>
      </div>

      <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} maxWidth="5xl">
        <ModalCreateEditPatient
            patient={patient}
            setOpenModalPatient={setIsEditModalOpen}
            communes={communes}
            regions={regions}
            provinces={provinces}
        />
      </Modal>
    </div>
  );
}
