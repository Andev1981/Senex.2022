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
    Info
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
      console.error("Error al buscar pacientes:", error.response ? error.response.data : error.message);
      setSearchResults([]);
    }
  };

  const handleSelectPatient = (patient, role) => {
    setSearchTerm("");
    setSearchResults([]);
    if (role === "holder") {
      setData({ ...data, holder_id: patient.id, holder_info: patient });
    } else if (role === "beneficiary" && !data.beneficiary_ids.includes(patient.id)) {
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
      beneficiaries_info: data.beneficiaries_info.filter((p) => p.id !== patientId),
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
          <SecondaryButton onClick={onClose} className="!px-10 !py-4">Descartar</SecondaryButton>
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
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="space-y-4 relative z-10">
                <label className="enterprise-label !text-brand-primary flex items-center gap-2 ml-1">
                    <Search className="w-4 h-4" /> Localizador de Pacientes
                </label>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray group-focus-within:text-brand-primary transition-colors" />
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
                    <div className="mt-4 bg-white border border-gray-100 rounded-2xl shadow-xl divide-y divide-gray-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                        {searchResults.map((patient) => (
                            <div key={patient.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{patient.name}</span>
                                    <span className="text-[9px] font-bold text-brand-gray uppercase font-mono">{patient.run}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSelectPatient(patient, "holder")}
                                        className="px-4 py-2 text-[9px] font-black uppercase tracking-widest bg-brand-primary text-white rounded-xl shadow-lg shadow-brand-primary/10 hover:brightness-110 active:scale-95 transition-all"
                                    >
                                        Definir Titular
                                    </button>
                                    <button
                                        onClick={() => handleSelectPatient(patient, "beneficiary")}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* TITULAR */}
            <div className="space-y-4">
                <h3 className="enterprise-label flex items-center gap-2 ml-1">
                    <UserCheck className="w-4 h-4 text-brand-primary" /> Titular del Plan
                </h3>
                <div className={`p-6 rounded-[2rem] border-2 transition-all min-h-[120px] flex items-center justify-center ${
                    data.holder_info ? 'bg-white border-brand-primary/20 shadow-xl' : 'bg-gray-50 border-gray-100 border-dashed'
                }`}>
                    {data.holder_info ? (
                        <div className="flex items-center gap-5 w-full">
                            <div className="w-12 h-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900 uppercase tracking-tight leading-none mb-1">{data.holder_info.name}</p>
                                <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest font-mono">{data.holder_info.run}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-2">
                            <Info className="w-6 h-6 text-gray-300 mx-auto" />
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sin titular asignado</p>
                        </div>
                    )}
                </div>
            </div>

            {/* BENEFICIARIOS */}
            <div className="space-y-4">
                <h3 className="enterprise-label flex items-center gap-2 ml-1">
                    <Users className="w-4 h-4 text-green-600" /> Cargas Familiares ({data.beneficiaries_info.length})
                </h3>
                <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm divide-y divide-gray-50 h-[120px] overflow-y-auto custom-scrollbar">
                    {data.beneficiaries_info.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">No hay beneficiarios</p>
                        </div>
                    ) : (
                        data.beneficiaries_info.map((p) => (
                            <div key={p.id} className="p-4 flex items-center justify-between group">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-tight">{p.name}</span>
                                    <span className="text-[8px] font-bold text-gray-400 uppercase font-mono">{p.run}</span>
                                </div>
                                <button
                                    onClick={() => handleRemoveBeneficiary(p.id)}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
            <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl text-red-500 shadow-sm">
                    <X className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">{errors.assignment_error}</p>
            </div>
        )}
      </div>
    </Modal>
  );
}
}
