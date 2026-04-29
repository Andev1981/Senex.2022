// resources/js/pages/KineMobile/MyPatients.jsx
import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Search, Users, Phone, FileText, ChevronRight, XCircle } from "lucide-react";
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
    router.visit(route("kine.patient.show", patientId));
  };

  return (
    <KineLayout>
      <Head title="Mis Pacientes" />

      <div className="min-h-screen pb-20 bg-[#FDFDFD]">
        {/* Content Header */}
        <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Mis Pacientes</h1>
              <div className="px-3 py-1 bg-brand-primary/10 rounded-full">
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
                  {totalPatients} pacientes
                </span>
              </div>
            </div>
        </div>

        {/* Buscador */}
        <div className="px-6 mb-6">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute w-4 h-4 text-slate-400 transition-colors group-focus-within:text-brand-primary transform -translate-y-1/2 left-4 top-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre, RUT o teléfono..."
                className="w-full py-4 pl-12 pr-12 bg-white border border-slate-100 rounded-[24px] shadow-sm focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all text-sm font-bold"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute text-slate-300 w-8 h-8 flex items-center justify-center transform -translate-y-1/2 right-3 top-1/2 hover:text-slate-600 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </form>
        </div>

        {/* Lista de pacientes */}
        <div className="px-6 space-y-4">
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
