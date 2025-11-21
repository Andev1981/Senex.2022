// resources/js/Pages/KineMobile/MyPatients.jsx
import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Search, Users, Phone, FileText, ChevronRight } from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";
import PatientCard from "./Partials/PatientCard";

export default function MyPatients({ patients, search, totalPatients }) {
  const [searchTerm, setSearchTerm] = useState(search || "");

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(
      route("kine.my-patients"),
      { search: searchTerm },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    router.get(
      route("kine.my-patients"),
      {},
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const handlePatientClick = (patientId) => {
    router.visit(route("kine.patients.show", patientId));
  };

  return (
    <KineLayout>
      <Head title="Mis Pacientes" />

      <div className="min-h-screen pb-20 bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-gray-900">Mis Pacientes</h1>
              <div className="px-3 py-1 bg-teal-100 rounded-full">
                <span className="text-sm font-semibold text-teal-700">
                  {totalPatients} pacientes
                </span>
              </div>
            </div>

            {/* Buscador */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, RUT o teléfono..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Lista de pacientes */}
        <div className="px-4 py-4">
          {patients.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg shadow-sm">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600">
                {searchTerm
                  ? "No se encontraron pacientes"
                  : "No tienes pacientes asignados"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {patients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onClick={() => handlePatientClick(patient.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </KineLayout>
  );
}
