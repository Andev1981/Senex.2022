import { useState } from "react";
import {
  Plus,
  User,
  Calendar,
  Mail,
  MapPin,
  X,
  Check,
  AlertCircle,
  FileText,
  Users,
} from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import TablePatients from "./TablePatients";

export default function IndexPatients({
  patients,
  communes,
  provinces,
  regions,
}) {
  const [selectedPatient, setSelectedPatient] = useState(null);

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
                onClick={() => alert("Nuevo paciente")}
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

        {/* Modal Detalle Paciente */}
        {selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold bg-white/20 backdrop-blur-sm rounded-xl">
                      {selectedPatient.nombre.charAt(0)}
                      {selectedPatient.apellido.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedPatient.nombre} {selectedPatient.apellido}
                      </h2>
                      <p className="text-blue-100">
                        RUT: {selectedPatient.rut}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="p-2 text-white transition-colors rounded-lg hover:bg-white/10"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="mb-1 text-sm text-gray-600">Estado</p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                        selectedPatient.estado === "Activo"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {selectedPatient.estado}
                    </span>
                  </div>

                  <div>
                    <p className="mb-1 text-sm text-gray-600">Estado de Pago</p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                        selectedPatient.payment_status === "Al día"
                          ? "bg-teal-100 text-teal-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {selectedPatient.payment_status}
                    </span>
                  </div>

                  <div>
                    <p className="mb-1 text-sm text-gray-600">
                      Fecha de Nacimiento
                    </p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="font-semibold text-gray-900">
                        {selectedPatient.birth_date}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-sm text-gray-600">Edad</p>
                    <p className="font-semibold text-gray-900">
                      {selectedPatient.edad} años
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="mb-1 text-sm text-gray-600">
                      Correo Electrónico
                    </p>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="font-semibold text-gray-900">
                        {selectedPatient.correo}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-sm text-gray-600">Comuna</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <p className="font-semibold text-gray-900">
                        {selectedPatient.comuna_name}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-sm text-gray-600">Dirección</p>
                    <p className="font-semibold text-gray-900">
                      {selectedPatient.full_address}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      alert("Ver detalle completo");
                      setSelectedPatient(null);
                    }}
                    className="flex-1 py-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Ver Detalle Completo
                  </button>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="px-6 py-3 font-semibold text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
