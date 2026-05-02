import React, { useState, useMemo } from "react";
import { useForm } from "@inertiajs/react";
import { 
  Database, 
  DollarSign, 
  Plus, 
  Trash2, 
  Save, 
  ShieldCheck, 
  Info,
  Layers,
  ChevronRight,
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import TextInput from "@/components/TextInput";
import InputPesoChileno from "@/components/InputPesoChileno";
import Swal from "sweetalert2";

export default function InsuranceTariff({ insurance, plans = [], sessionTypes = [], onClose }) {
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || null);
  const [filterText, setFilterText] = useState("");

  // Plan seleccionado actualmente
  const selectedPlan = useMemo(() => plans.find(p => p.id === selectedPlanId), [plans, selectedPlanId]);

  // Formulario para el tarifario (Reglas de Convenio)
  // Nota: En un sistema real, esto guardaría múltiples registros. Por simplicidad, guardaremos uno por uno o por lote.
  const { data, setData, post, processing, errors } = useForm({
    agreement_id: insurance.active_agreement?.id || null, // Asumimos que hay un convenio activo
    rules: [] 
  });

  const filteredItems = useMemo(() => {
    return sessionTypes.filter(item => 
        item.name.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [sessionTypes, filterText]);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* HEADER */}
      <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-primary text-white rounded-2xl shadow-xl shadow-brand-primary/20 transform rotate-3">
                <DollarSign className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none mb-1">Tarifario de Convenio</h2>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest">{insurance.name}</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-xl border border-brand-primary/10 shadow-sm">
                {plans.length} Niveles de Cobertura
            </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR: NIVELES DE COBERTURA */}
        <div className="w-72 border-r border-gray-100 bg-gray-50/30 flex flex-col">
            <div className="p-6 border-b border-gray-100">
                <p className="enterprise-label !text-brand-primary mb-4 flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Niveles (Planes)
                </p>
                <div className="space-y-2">
                    {plans.map(plan => (
                        <button
                            key={plan.id}
                            onClick={() => setSelectedPlanId(plan.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                                selectedPlanId === plan.id 
                                ? 'bg-white border-brand-primary/20 shadow-md translate-x-2' 
                                : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-100'
                            }`}
                        >
                            <div className="text-left">
                                <p className={`text-[10px] font-black uppercase tracking-tight ${selectedPlanId === plan.id ? 'text-brand-primary' : ''}`}>
                                    {plan.name}
                                </p>
                                <p className="text-[8px] font-bold opacity-50 uppercase tracking-widest">{plan.code}</p>
                            </div>
                            {selectedPlanId === plan.id && <ChevronRight className="w-3 h-3 text-brand-primary" />}
                        </button>
                    ))}
                    <button className="w-full flex items-center gap-2 p-4 text-[9px] font-black text-brand-primary uppercase tracking-widest border border-dashed border-brand-primary/20 rounded-2xl hover:bg-brand-primary/5 transition-all mt-4">
                        <Plus className="w-3 h-3" /> Añadir Nivel
                    </button>
                </div>
            </div>
        </div>

        {/* MAIN: TARIFARIO */}
        <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedPlan ? (
                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30">
                    <AlertCircle className="w-16 h-16 mb-4" />
                    <p className="enterprise-label uppercase">Selecciona un nivel de cobertura para gestionar sus precios</p>
                </div>
            ) : (
                <>
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white shrink-0">
                        <div className="relative w-72">
                            <Search className="absolute w-3.5 h-3.5 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                value={filterText}
                                onChange={e => setFilterText(e.target.value)}
                                placeholder="Filtrar servicios..." 
                                className="w-full py-2.5 pl-10 pr-4 bg-gray-50 border-transparent rounded-xl text-[10px] font-bold uppercase tracking-widest focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none" 
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Editando Tarifas para:</p>
                                <p className="text-xs font-black text-brand-primary uppercase">{selectedPlan.name}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/30">
                        {filteredItems.map(item => {
                            // En un entorno real, buscaríamos la regla actual en `selectedPlan.agreement_rules`
                            return (
                                <div key={item.id} className="bg-white border border-gray-100 rounded-3xl p-5 flex items-center gap-6 shadow-sm hover:shadow-xl transition-all group">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight mb-1">{item.name}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase">Particular: {item.price?.toLocaleString('es-CL', {style:'currency', currency:'CLP'})}</span>
                                            <div className="h-1 w-1 bg-gray-200 rounded-full"></div>
                                            <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">ID: {item.id}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Valor Pactado</label>
                                            <InputPesoChileno className="!py-2 !px-3 !rounded-xl !text-xs !font-black !w-32 bg-gray-50/50" placeholder="$ 0" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-brand-primary uppercase tracking-widest ml-1">Copago Paciente</label>
                                            <InputPesoChileno className="!py-2 !px-3 !rounded-xl !text-xs !font-black !w-32 bg-white border-brand-primary/20" placeholder="$ 0" />
                                        </div>
                                        <button className="p-3 text-gray-300 hover:text-brand-primary hover:bg-brand-secondary/10 rounded-xl transition-all mt-4">
                                            <Save className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4 shrink-0 rounded-b-[2rem]">
          <SecondaryButton onClick={onClose} className="!px-10 !py-4">Cerrar Tarifario</SecondaryButton>
          <PrimaryButton className="!px-14 !py-4 shadow-xl shadow-brand-primary/20">
              <ShieldCheck className="w-4 h-4 mr-2" /> Finalizar Auditoría
          </PrimaryButton>
      </div>
    </div>
  );
}
