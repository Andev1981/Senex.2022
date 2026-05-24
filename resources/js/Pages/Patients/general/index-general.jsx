import React, { useState } from "react";
import PatientData from "./general-partials/patient-data";
import Vital from "./general-partials/vital";
import EmergencyContact from "./general-partials/emergency-contact";
import PatientAddress from "./general-partials/patient-address";
import MedicalHistoryCard from "./general-partials/medical-history-card";
import ModalCreateEditPatient from "../modal-create-edit-patient";
import { exportClinicalRecordPDF } from "@/utils/clinical-pdf-export";
import Modal from "@/components/Modal";
import { UserCog, FileDown } from "lucide-react";

export default function IndexGeneral({
  patient,
  communes,
  regions,
  address,
  vital,
  contact,
  sessions = [], // Aseguramos recibir sesiones
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="space-y-8 duration-500 animate-in fade-in">
      {/* BOTÓN DE EDICIÓN MAESTRA & EXPORTACIÓN */}
      <div className="flex justify-end gap-4 px-2">
        <button 
            onClick={() => exportClinicalRecordPDF(patient, sessions)}
            className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm active:scale-95 group"
        >
            <FileDown className="w-4 h-4 text-brand-primary group-hover:bounce transition-transform" />
            Exportar Ficha PDF
        </button>

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
          <MedicalHistoryCard patient={patient} />
          <PatientData
            patient={patient}
            communes={communes}
            regions={regions}
          />
          <PatientAddress
            patient={patient}
            communes={communes}
            regions={regions}
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
        />
      </Modal>
    </div>
  );
}
