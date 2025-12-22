import { useEffect, useRef, useState } from "react";
import { Plus, User, Check, AlertCircle, FileText, Users } from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import TablePatients from "./TablePatients";
import ModalCreateEditPatient from "./ModalCreateEditPatient";
import SideModal from "@/Components/SideModal";
import usePatientStore from "@/Stores/usePatientStore";

export default function IndexPatients({
  patients: initialPatients,
  communes,
  provinces,
  regions,
}) {
  const addButtonRef = useRef(null);
  const [openPatientModal, setOpenPatientModal] = useState(false);
  // 1. Obtenemos las acciones de Zustand
  const patients = usePatientStore((state) => state.patients);
  const setPatients = usePatientStore((state) => state.setPatients);

  // 2. Sincronizamos cuando cambien las props de Inertia
  useEffect(() => {
    if (initialPatients) {
      setPatients(initialPatients);
    }
  }, [initialPatients]);

  return (
    <AuthenticatedLayout>
      <Head title="Pacientes" />
      <div className="min-h-screen p-4 bg-gray-50">
        {/* Header */}
        <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
                <p className="text-sm text-gray-600">
                  Gestión de pacientes registrados
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                ref={addButtonRef}
                onClick={() => setOpenPatientModal(true)}
                className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 shadow-blue-500/30"
              >
                <Plus className="w-4 h-4" />
                Nuevo Paciente
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
          <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Total Pacientes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {patients.length}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Activos</p>
                <p className="text-3xl font-bold text-green-600">
                  {patients.filter((p) => p.status === "active").length}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Al Día</p>
                <p className="text-3xl font-bold text-teal-600">
                  {patients.filter((p) => p.payment_status === "ok").length}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Con Deuda</p>
                <p className="text-3xl font-bold text-orange-600">
                  {patients.filter((p) => p.payment_status === "due").length}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <TablePatients patients={patients} communes={communes} />
      </div>
      <SideModal
        open={openPatientModal}
        onClose={() => setOpenPatientModal(false)}
        title="Nuevo Paciente"
        description="Datos del nuevo paciente"
        width="4xl"
      >
        <ModalCreateEditPatient
          patient={null}
          setOpenModalPatient={setOpenPatientModal}
          communes={communes}
          regions={regions}
          provinces={provinces}
        />
      </SideModal>
    </AuthenticatedLayout>
  );
}
