import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  Mail,
  Percent,
  Phone,
  Save,
  Search,
  UserCog,
  UserMinus,
  Users,
  ChevronDown,
  Loader2,
  Activity,
  Award,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  TrendingUp,
  XCircle,
  Database
} from "lucide-react";
import { fmtCLP } from "@/utils/utils";
import Swal from "sweetalert2";
import InputPesoChileno from "@/Components/InputPesoChileno";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";

export default function DoctorModalForm({
  selectedDoctor,
  setIsModalOpen,
  patients = [],
  getStatusBadge,
}) {
  const [localDoctor, setLocalDoctor] = useState(selectedDoctor);
  const [isEditingCommission, setIsEditingCommission] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [commissionDraft, setCommissionDraft] = useState({});
  const [patientQuery, setPatientQuery] = useState("");
  const [patientsDraft, setPatientsDraft] = useState([]);
  const [openSection, setOpenSection] = useState("commissions");

  useEffect(() => {
    if (selectedDoctor) {
      setLocalDoctor(selectedDoctor);
      setPatientsDraft(selectedDoctor.patients || []);
      if (!isEditingCommission) setCommissionDraft({});
    }
  }, [selectedDoctor?.id]);

  const getRuleDisplay = (summaryItem) => {
    const sessionTypeId = summaryItem.session_type_id;
    if (commissionDraft[sessionTypeId]) return { ...commissionDraft[sessionTypeId], is_dirty: true };
    return {
      type: "fixed_amount",
      value: summaryItem.is_customized ? summaryItem.current_value : "",
      price_to_patient: summaryItem.price_to_patient,
      is_customized: summaryItem.is_customized,
      current_value: summaryItem.current_value,
      default_value: summaryItem.default_value,
    };
  };

  const setDraft = (sessionTypeId, value) => {
    setCommissionDraft((prev) => {
      const originalSummary = localDoctor.rates_summary.find(r => r.session_type_id === sessionTypeId);
      const currentDraft = prev[sessionTypeId] || {
        type: "fixed_amount",
        value: originalSummary.is_customized ? originalSummary.current_value : "",
      };
      return { ...prev, [sessionTypeId]: { ...currentDraft, value: value } };
    });
  };

  const saveCommissionRules = async () => {
    if (!localDoctor) return;
    setIsSaving(true);
    const rules = Object.entries(commissionDraft).map(([stId, draft]) => {
      const rawValue = String(draft.value).replace(/[^0-9.]/g, "");
      const numValue = rawValue === "" ? null : Number(rawValue);
      const original = localDoctor.rates_summary.find(r => r.session_type_id === Number(stId));
      return {
        session_type_id: Number(stId),
        type: "fixed_amount",
        value: numValue,
        base_price_clp: original?.price_to_patient || 0,
      };
    });

    try {
      const response = await axios.post(route("doctors.commission-rules.update", localDoctor.id), { rules });
      if (response.data.success) {
        setLocalDoctor(prev => ({ ...prev, rates_summary: response.data.updated_summary }));
        setIsEditingCommission(false);
        setCommissionDraft({});
        Swal.fire({ icon: "success", title: "Configuración Guardada", showConfirmButton: false, timer: 1500 });
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudieron actualizar las tarifas." });
    } finally { setIsSaving(false); }
  };

  const assignedPatientIds = new Set(patientsDraft.map((p) => p.id));
  const availablePatients = useMemo(() => {
    if (!localDoctor) return [];
    return patients.filter(p => !assignedPatientIds.has(p.id) && (patientQuery.trim().length === 0 || [p.name, p.rut].join(" ").toLowerCase().includes(patientQuery.toLowerCase())));
  }, [localDoctor, patientQuery, patients, patientsDraft]);

  const assignPatient = async (patientId) => {
    const patientObj = patients.find(p => p.id === patientId);
    try {
      const response = await axios.post(route("doctors.patients.assign", localDoctor.id), { patient_id: patientId });
      if (response.data.success) {
        setPatientsDraft(prev => [...prev, patientObj]);
        setPatientQuery("");
      }
    } catch (e) { Swal.fire({ icon: "error", title: "Error de asignación" }); }
  };

  const unassignPatient = async (patientId) => {
    try {
      const response = await axios.delete(route("doctors.patients.unassign", [localDoctor.id, patientId]));
      if (response.data.success) setPatientsDraft(prev => prev.filter(p => p.id !== patientId));
    } catch (e) { Swal.fire({ icon: "error", title: "Error al desvincular" }); }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {!localDoctor ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/30">
                    <div className="p-4 mb-4 bg-white rounded-2xl text-brand-gray/20 shadow-sm">
                        <UserCog className="w-10 h-10" />
                    </div>
                    <p className="enterprise-label">Seleccione un profesional para gestionar</p>
                    <p className="text-[10px] font-medium text-brand-gray opacity-40 uppercase tracking-widest mt-1">Configuración técnica de perfil</p>
                </div>
      ) : (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
          {/* PERFIL HERO */}
          <div className="p-8 border-b border-gray-100 bg-gray-50/30 relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
            
            <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-brand-primary text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-brand-primary/20 transform -rotate-3">
                        {localDoctor.name.charAt(0)}{localDoctor.last_name.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{localDoctor.name} {localDoctor.last_name}</h2>
                            {getStatusBadge(localDoctor.branch_status)}
                        </div>
                        <p className="text-xs font-black text-brand-primary uppercase tracking-widest flex items-center gap-2 mb-3">
                            <Award className="w-3.5 h-3.5" /> {localDoctor.speciality || 'Especialista General'}
                        </p>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-brand-gray uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {localDoctor.email}</span>
                            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {localDoctor.phone}</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* CONTENIDO SCROLLABLE */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
            
            {/* ESTRUCTURA DE COMISIONES */}
            <div className={`rounded-xl border-2 transition-all duration-500 overflow-hidden ${openSection === 'commissions' ? 'border-brand-primary/20 shadow-xl' : 'border-gray-50'}`}>
                <button onClick={() => setOpenSection("commissions")} className={`w-full flex items-center justify-between p-6 transition-all ${openSection === 'commissions' ? 'bg-brand-primary/5' : 'bg-white hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${openSection === 'commissions' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <Percent className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="enterprise-label !mb-0">Acuerdos de Pago</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estructura de comisiones por sesión</p>
                        </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${openSection === 'commissions' ? 'rotate-180 text-brand-primary' : 'text-gray-300'}`} />
                </button>

                {openSection === 'commissions' && (
                    <div className="p-6 bg-white space-y-6 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex justify-end px-2">
                            {!isEditingCommission ? (
                                <SecondaryButton onClick={() => setIsEditingCommission(true)} className="!text-[9px] !py-2">Actualizar Tarifas</SecondaryButton>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => { setIsEditingCommission(false); setCommissionDraft({}); }} className="px-4 py-2 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 transition-all">Cancelar</button>
                                    <PrimaryButton onClick={saveCommissionRules} disabled={isSaving} className="!text-[9px] !py-2 shadow-lg shadow-brand-primary/20">
                                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Guardar Cambios
                                    </PrimaryButton>
                                </div>
                            )}
                        </div>

                        <div className="border border-gray-100 rounded-3xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr className="enterprise-label text-[9px]">
                                        <th className="px-6 py-4 text-left">Tipo de Atención</th>
                                        <th className="px-6 py-4 text-right">Tarifa Estándar</th>
                                        <th className="px-6 py-4 text-right">Acuerdo Profesional</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {localDoctor.rates_summary?.map((summaryItem) => {
                                        const rule = getRuleDisplay(summaryItem);
                                        const basePrice = Number(summaryItem.price_to_patient || summaryItem.base_price_clp || 0);
                                        return (
                                            <tr key={summaryItem.session_type_id} className="hover:bg-brand-secondary/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="text-xs font-black text-gray-800 uppercase tracking-tight">{summaryItem.name}</p>
                                                    <p className="text-[9px] font-bold text-brand-gray opacity-60">PVP: {fmtCLP(basePrice)}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-mono text-xs font-bold text-gray-400">{fmtCLP(summaryItem.default_value)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {isEditingCommission ? (
                                                        <InputPesoChileno
                                                            price={rule.value}
                                                            onChange={(e) => setDraft(summaryItem.session_type_id, e.target.value)}
                                                            className={`w-32 !py-2 !px-3 !rounded-xl !text-right font-black !text-xs ${rule.value ? 'bg-brand-primary/5 border-brand-primary/30 text-brand-primary' : 'bg-gray-50 border-gray-100'}`}
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-end">
                                                            <span className={`text-sm font-black font-mono ${rule.is_customized ? 'text-brand-primary' : 'text-gray-600'}`}>
                                                                {fmtCLP(rule.is_customized ? rule.current_value : summaryItem.default_value)}
                                                            </span>
                                                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${rule.is_customized ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                                {rule.is_customized ? 'Especial' : 'Base'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* PACIENTES ASIGNADOS */}
            <div className={`rounded-xl border-2 transition-all duration-500 overflow-hidden ${openSection === 'patients' ? 'border-brand-primary/20 shadow-xl' : 'border-gray-50'}`}>
                <button onClick={() => setOpenSection("patients")} className={`w-full flex items-center justify-between p-6 transition-all ${openSection === 'patients' ? 'bg-brand-primary/5' : 'bg-white hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${openSection === 'patients' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="enterprise-label !mb-0">Cartera de Pacientes</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profesional preferente para {patientsDraft.length} usuarios</p>
                        </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${openSection === 'patients' ? 'rotate-180 text-brand-primary' : 'text-gray-300'}`} />
                </button>

                {openSection === "patients" && (
                    <div className="p-8 bg-white space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray group-focus-within:text-brand-primary transition-colors" />
                            <input
                                className="w-full pl-12 pr-4 py-4 text-sm font-bold border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary transition-all outline-none"
                                placeholder="Vincular nuevo paciente por RUT o Nombre..."
                                value={patientQuery}
                                onChange={(e) => setPatientQuery(e.target.value)}
                            />
                            {patientQuery && availablePatients.length > 0 && (
                                <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-50 overflow-hidden border-t-brand-primary border-t-4">
                                    {availablePatients.map((p) => (
                                        <button key={p.id} onClick={() => assignPatient(p.id)} className="w-full text-left px-6 py-4 hover:bg-brand-secondary/5 transition-all flex justify-between items-center group border-b border-gray-50 last:border-0">
                                            <div>
                                                <p className="text-sm font-black text-gray-800 uppercase tracking-tight">{p.full_name}</p>
                                                <p className="text-[10px] font-bold text-brand-gray font-mono">{p.rut}</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-brand-primary opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {patientsDraft.map((p) => (
                                <div key={p.id} className="p-5 bg-gray-50/50 border border-gray-100 rounded-2xl flex items-center justify-between group hover:border-brand-primary/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-brand-primary shadow-sm">
                                            <UserCog className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{p.full_name}</p>
                                            <p className="text-[9px] font-bold text-brand-gray opacity-60 font-mono">{p.rut}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => unassignPatient(p.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90">
                                        <UserMinus className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {patientsDraft.length === 0 && (
                                <div className="col-span-2 py-10 text-center opacity-30">
                                    <Users className="w-10 h-10 mx-auto mb-3" />
                                    <p className="enterprise-label">Sin pacientes asignados</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}