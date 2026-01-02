import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import {
  User,
  Users,
  X,
  CheckCircle,
  Search,
  ShieldCheck,
  Briefcase,
  UserCheck,
  Plus,
  Trash2,
  Info,
} from "lucide-react";
import axios from "axios";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";

export default function AgreementFamilyAssignModal({ plan, isOpen, onClose }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    holder_id: null,
    beneficiary_ids: [],
    holder_info: null,
    beneficiaries_info: [],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (query) => {
    if (query.length < 3) return setSearchResults([]);
    const url = route("api.patients.search", { q: query });
    try {
      const response = await axios.get(url);
      const patientData = response.data;
      const selectedIds = [data.holder_id, ...data.beneficiary_ids]
        .filter(Boolean)
        .map((id) => id.toString());
      const filtered = patientData.filter(
        (p) => !selectedIds.includes(p.id.toString())
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error(
        "Error al buscar pacientes:",
        error.response ? error.response.data : error.message
      );
      setSearchResults([]);
    }
  };

  const handleSelectPatient = (patient, role) => {
    setSearchTerm("");
    setSearchResults([]);
    if (role === "holder") {
      setData({ ...data, holder_id: patient.id, holder_info: patient });
    } else if (
      role === "beneficiary" &&
      !data.beneficiary_ids.includes(patient.id)
    ) {
      setData({
        ...data,
        beneficiary_ids: [...data.beneficiary_ids, patient.id],
        beneficiaries_info: [...data.beneficiaries_info, patient],
      });
    }
  };

  const handleRemoveBeneficiary = (patientId) => {
    setData({
      ...data,
      beneficiary_ids: data.beneficiary_ids.filter((id) => id !== patientId),
      beneficiaries_info: data.beneficiaries_info.filter(
        (p) => p.id !== patientId
      ),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.holder_id) return;
    post(route("plans.assign.family", plan.id), {
      onSuccess: () => {
        onClose();
        reset();
      },
      preserveScroll: true,
    });
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title="Configuración de Grupo Familiar"
      subtitle={`Vinculación para: ${plan?.name}`}
      icon={Users}
      footer={
        <>
          <SecondaryButton onClick={onClose} className="!px-10 !py-4">
            Descartar
          </SecondaryButton>
          <PrimaryButton
            disabled={processing || !data.holder_id}
            onClick={handleSubmit}
            className="!px-14 !py-4 shadow-xl shadow-brand-primary/20"
          >
            {processing ? "Sincronizando..." : "Asignar Plan Familiar"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-10">
        {/* BUSCADOR */}
        <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-brand-primary/5 blur-2xl"></div>
          <div className="relative z-10 space-y-4">
            <label className="enterprise-label !text-brand-primary flex items-center gap-2 ml-1">
              <Search className="w-4 h-4" /> Localizador de Pacientes
            </label>
            <div className="relative group">
              <Search className="absolute w-4 h-4 transition-colors -translate-y-1/2 left-4 top-1/2 text-brand-gray group-focus-within:text-brand-primary" />
              <TextInput
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="w-full pl-12 !rounded-2xl !py-4 shadow-inner text-sm font-bold uppercase"
                placeholder="RUN O NOMBRE COMPLETO (MIN 3 CARACTERES)..."
              />
            </div>

            {/* RESULTADOS */}
            {searchResults.length > 0 && (
              <div className="mt-4 overflow-hidden overflow-y-auto bg-white border border-gray-100 divide-y shadow-xl rounded-2xl divide-gray-50 max-h-60 custom-scrollbar">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight">
                        {patient.name}
                      </span>
                      <span className="text-[9px] font-bold text-brand-gray uppercase font-mono">
                        {patient.run}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSelectPatient(patient, "holder")}
                        className="px-4 py-2 text-[9px] font-black uppercase tracking-widest bg-brand-primary text-white rounded-xl shadow-lg shadow-brand-primary/10 hover:brightness-110 active:scale-95 transition-all"
                      >
                        Definir Titular
                      </button>
                      <button
                        onClick={() =>
                          handleSelectPatient(patient, "beneficiary")
                        }
                        className="px-4 py-2 text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
                      >
                        Añadir Carga
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ASIGNACIONES ACTUALES */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* TITULAR */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 ml-1 enterprise-label">
              <UserCheck className="w-4 h-4 text-brand-primary" /> Titular del
              Plan
            </h3>
            <div
              className={`p-6 rounded-[2rem] border-2 transition-all min-h-[120px] flex items-center justify-center ${
                data.holder_info
                  ? "bg-white border-brand-primary/20 shadow-xl"
                  : "bg-gray-50 border-gray-100 border-dashed"
              }`}
            >
              {data.holder_info ? (
                <div className="flex items-center w-full gap-5">
                  <div className="flex items-center justify-center w-12 h-12 text-white transform shadow-lg bg-brand-primary rounded-2xl rotate-3">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-black leading-none tracking-tight text-gray-900 uppercase">
                      {data.holder_info.name}
                    </p>
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest font-mono">
                      {data.holder_info.run}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-center">
                  <Info className="w-6 h-6 mx-auto text-gray-300" />
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Sin titular asignado
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* BENEFICIARIOS */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 ml-1 enterprise-label">
              <Users className="w-4 h-4 text-green-600" /> Cargas Familiares (
              {data.beneficiaries_info.length})
            </h3>
            <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm divide-y divide-gray-50 h-[120px] overflow-y-auto custom-scrollbar">
              {data.beneficiaries_info.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                    No hay beneficiarios
                  </p>
                </div>
              ) : (
                data.beneficiaries_info.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-4 group"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-700 uppercase tracking-tight">
                        {p.name}
                      </span>
                      <span className="text-[8px] font-bold text-gray-400 uppercase font-mono">
                        {p.run}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveBeneficiary(p.id)}
                      className="p-2 text-gray-300 transition-all rounded-lg hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {errors.assignment_error && (
          <div className="flex items-center gap-4 p-6 border border-red-100 bg-red-50 rounded-2xl">
            <div className="p-2 text-red-500 bg-white shadow-sm rounded-xl">
              <X className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">
              {errors.assignment_error}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
