import { useEffect, useRef, useState } from "react";
import { Plus, User, Check, AlertCircle, FileText, Users } from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import TablePatients from "./table-patients";
import ModalCreateEditPatient from "./modal-create-edit-patient";
import SideModal from "@/components/SideModal";
import usePatientStore from "@/Stores/usePatientStore";

export default function IndexPatients({
  patients,
  communes,
  regions,
  user,
  business_type = 'clinical'
}) {
  const addButtonRef = useRef(null);
  const [openPatientModal, setOpenPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const isClinical = business_type === 'clinical';
  const entityLabel = isClinical ? 'Paciente' : 'Cliente';
  const pluralLabel = isClinical ? 'Pacientes' : 'Clientes';

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setOpenPatientModal(true);
  };

  const handleCloseModal = () => {
    setOpenPatientModal(false);
    setTimeout(() => setSelectedPatient(null), 300); // Wait for animation
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Directorio de ${pluralLabel}`} />

      <div className="min-h-screen p-6 md:p-10 bg-gray-50/50 space-y-10">
        
        {/* HEADER HERO PREMIUM */}
        <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-5">
              <div className="flex items-center justify-center w-16 h-16 bg-brand-primary text-white rounded-2xl shadow-xl shadow-brand-primary/20 transform rotate-3">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-none mb-2">
                    Directorio de {pluralLabel}
                </h1>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
                  {isClinical 
                    ? "Gestión Centralizada • Base de Datos Clínica" 
                    : business_type === 'service' 
                        ? "Cartera Comercial • Consultoría & Servicios" 
                        : "Control de Clientes • Venta Retail"}
                </p>
              </div>
            </div>
            <button
                ref={addButtonRef}
                onClick={() => {
                  setSelectedPatient(null);
                  setOpenPatientModal(true);
                }}
                className="flex items-center gap-3 px-8 py-4 font-black uppercase tracking-widest text-[10px] text-white transition-all bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-95"
            >
                <Plus className="w-4 h-4" /> Registrar {entityLabel}
            </button>
          </div>
        </div>

        {/* Stats Cards Enterprise */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-xl hover:scale-[1.02] transition-all duration-300 group">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-brand-secondary/10 text-brand-primary rounded-xl group-hover:rotate-12 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <span className="enterprise-label mb-0! opacity-40 text-[8px]">Universo</span>
            </div>
            <p className="enterprise-label opacity-60 mb-1">Total Registrados</p>
            <p className="text-4xl font-black text-gray-900 tracking-tighter leading-none">
              {patients.length}
            </p>
          </div>

          <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-xl hover:scale-[1.02] transition-all duration-300 group border-b-4 border-b-green-500">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:rotate-12 transition-transform">
                <Check className="w-6 h-6" />
              </div>
              <span className="enterprise-label mb-0! text-green-600 opacity-60 text-[8px]">Operativos</span>
            </div>
            <p className="enterprise-label opacity-60 mb-1 text-green-700/60">{pluralLabel} Activos</p>
            <p className="text-4xl font-black text-green-600 tracking-tighter leading-none">
              {patients.filter((p) => p.status === "active").length}
            </p>
          </div>

          <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-xl hover:scale-[1.02] transition-all duration-300 group">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-brand-secondary/10 text-brand-primary rounded-xl group-hover:rotate-12 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <span className="enterprise-label mb-0! text-brand-primary opacity-60 text-[8px]">Finanzas</span>
            </div>
            <p className="enterprise-label opacity-60 mb-1">{isClinical ? "Fichas al Día" : "Cuentas al Día"}</p>
            <p className="text-4xl font-black text-brand-primary tracking-tighter leading-none">
              {patients.filter((p) => p.payment_status === "ok").length}
            </p>
          </div>

          <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-xl hover:scale-[1.02] transition-all duration-300 group border-b-4 border-b-orange-500">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:rotate-12 transition-transform">
                <AlertCircle className="w-6 h-6" />
              </div>
              <span className="enterprise-label mb-0! text-orange-600 opacity-60 text-[8px]">Riesgo</span>
            </div>
            <p className="enterprise-label opacity-60 mb-1 text-orange-700/60">Saldo Pendiente</p>
            <p className="text-4xl font-black text-orange-600 tracking-tighter leading-none">
              {patients.filter((p) => (p.due_amount || 0) > 0).length}
            </p>
          </div>
        </div>

        <TablePatients 
          patients={patients} 
          communes={communes} 
          user={user} 
          handleEditPatient={handleEditPatient}
          business_type={business_type}
        />
      </div>

      <SideModal
        open={openPatientModal}
        onClose={handleCloseModal}
        width="5xl"
      >
        <ModalCreateEditPatient
          patient={selectedPatient}
          setOpenModalPatient={setOpenPatientModal}
          communes={communes}
          regions={regions}
          business_type={business_type}
        />
      </SideModal>
    </AuthenticatedLayout>
  );
}
