import React, { useState, useMemo, useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
import axios from "axios";
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
  AlertCircle,
  Clock,
  Pencil
} from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import TextInput from "@/components/TextInput";
import InputPesoChileno from "@/components/InputPesoChileno";
import SideModal from "@/components/SideModal";
import PlanForm from "../../plans/Partials/PlanForm";
import Swal from "sweetalert2";
import { toast } from "sonner";

export default function InsuranceTariff({ insurance, plans = [], sessionTypes = [], onClose }) {
  // 1. Blindaje contra nulos
  if (!insurance) return null;

  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || null);
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState(null);

  // El convenio activo viene inyectado desde el controlador
  const activeAgreement = insurance.active_agreement;

  // --- LÓGICA DE ESTADO LOCAL PARA REGLAS (MÁS REACTIVO) ---
  const [localRules, setLocalRules] = useState({});

  useEffect(() => {
    if (activeAgreement?.rules) {
        const rulesMap = activeAgreement.rules.reduce((acc, rule) => {
            const key = `${rule.item_id}_${rule.plan_id || 'general'}`;
            acc[key] = rule;
            return acc;
        }, {});
        setLocalRules(rulesMap);
    }
  }, [activeAgreement]);

  // Plan seleccionado actualmente
  const selectedPlan = useMemo(() => plans.find(p => p.id === selectedPlanId), [plans, selectedPlanId]);

  const filteredItems = useMemo(() => {
    return sessionTypes.filter(item => 
        item.name.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [sessionTypes, filterText]);

  const handleSaveRule = (item, prices) => {
    if (!activeAgreement) {
        Swal.fire('Error', 'No hay un convenio activo para esta aseguradora.', 'error');
        return;
    }

    if (prices.patient_share_clp > prices.gross_price_clp) {
        Swal.fire('Atención', 'El copago del paciente no puede ser mayor al valor pactado.', 'warning');
        return;
    }

    setLoading(true);
    
    // CAMBIO A AXIOS PARA MEJOR REACTIVIDAD
    axios.post(route('agreement.rules.upsert'), {
        agreement_id: activeAgreement.id,
        item_id: item.id,
        plan_id: selectedPlanId,
        gross_price_clp: Math.round(prices.gross_price_clp),
        patient_share_clp: Math.round(prices.patient_share_clp)
    })
    .then(response => {
        if (response.data.success) {
            const updatedRule = response.data.rule;
            const key = `${updatedRule.item_id}_${updatedRule.plan_id || 'general'}`;
            
            // Actualizamos solo la regla cambiada en el estado local
            setLocalRules(prev => ({
                ...prev,
                [key]: updatedRule
            }));
            
            toast.success('Tarifa actualizada');
        }
    })
    .catch(error => {
        console.error(error);
        toast.error('Error al guardar la tarifa');
    })
    .finally(() => {
        setLoading(false);
    });
  };

  const handleCreateAgreement = () => {
    router.post(route('agreements.store'), {
        insurance_id: insurance.id,
        name: `Tarifario Maestro - ${insurance.name}`,
        is_active: true,
        start_date: new Date().toISOString().split('T')[0]
    }, {
        onSuccess: () => Swal.fire('¡Éxito!', 'Convenio activado. Ya puedes cargar tarifas.', 'success')
    });
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden duration-300 animate-in fade-in">
      {/* HEADER HERO */}
      <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
        <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-brand-primary text-white rounded-2xl shadow-xl shadow-brand-primary/20 transform rotate-3">
                <DollarSign className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none mb-1">Tarifario & Convenios</h2>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest">{insurance.name}</p>
            </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
            {!activeAgreement && (
                <button 
                    onClick={handleCreateAgreement}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Activar Convenio
                </button>
            )}
            <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-xl border border-brand-primary/10 shadow-sm">
                {plans.length} Niveles Detectados
            </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR: NIVELES DE COBERTURA */}
        <div className="w-80 border-r border-gray-100 bg-gray-50/20 flex flex-col shrink-0">
            <div className="p-6 border-b border-gray-100 bg-white/50">
                <p className="enterprise-label !text-brand-primary flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" /> Niveles de Cobertura
                </p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Selecciona para editar tarifas
                </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {plans.map(plan => (
                    <div key={plan.id} className="group relative flex items-center gap-2">
                        <button
                            onClick={() => setSelectedPlanId(plan.id)}
                            className={`flex-1 flex items-center justify-between p-5 rounded-3xl transition-all border overflow-hidden ${
                                selectedPlanId === plan.id 
                                ? 'bg-white border-brand-primary/30 shadow-xl shadow-brand-primary/5 translate-x-1 ring-1 ring-brand-primary/10' 
                                : 'bg-transparent border-transparent text-gray-400 hover:bg-white hover:border-gray-100 hover:text-gray-600'
                            }`}
                        >
                            <div className="text-left relative z-10">
                                <p className={`text-[11px] font-black uppercase tracking-tight mb-0.5 ${selectedPlanId === plan.id ? 'text-brand-primary' : ''}`}>
                                    {plan.name}
                                </p>
                                <p className="text-[8px] font-bold opacity-50 uppercase tracking-widest leading-none">{plan.code}</p>
                            </div>
                            {selectedPlanId === plan.id && (
                                <div className="relative z-10 p-1.5 bg-brand-primary/10 rounded-lg">
                                    <ChevronRight className="w-3.5 h-3.5 text-brand-primary" />
                                </div>
                            )}
                            {selectedPlanId === plan.id && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary"></div>
                            )}
                        </button>

                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setPlanToEdit(plan);
                                setIsPlanFormOpen(true);
                            }}
                            className="p-3 text-gray-300 hover:text-brand-primary hover:bg-white rounded-2xl border border-transparent hover:border-gray-100 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                            title="Editar nombre/código"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {plans.length === 0 && (
                    <div className="py-20 text-center opacity-30">
                        <Layers className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Sin niveles registrados</p>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white/50">
                <button 
                    onClick={() => {
                        setSelectedPlanId(null);
                        setIsPlanFormOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Añadir Nuevo Nivel
                </button>
            </div>
            
            <div className="p-6 bg-white border-t border-gray-100">
                <div className="p-5 bg-brand-primary/5 rounded-[2rem] border border-brand-primary/10">
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1.5 leading-tight flex items-center gap-2">
                        <Info className="w-3 h-3" /> Ayuda
                    </p>
                    <p className="text-[9px] font-bold text-brand-gray/70 leading-relaxed uppercase">
                        El tarifario aplica solo para el nivel seleccionado. Si el paciente no tiene nivel asignado, el sistema buscará la regla general.
                    </p>
                </div>
            </div>
        </div>

        {/* MAIN: TARIFARIO */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {!selectedPlan ? (
                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center bg-gray-50/20">
                    <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-center mb-6">
                        <AlertCircle className="w-10 h-10 text-gray-200" />
                    </div>
                    <p className="enterprise-label uppercase opacity-40">Selecciona un nivel de cobertura para gestionar sus precios</p>
                </div>
            ) : !activeAgreement ? (
                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center bg-gray-50/20">
                    <div className="p-8 bg-white border border-gray-100 shadow-xl rounded-[3rem] mb-8">
                        <Database className="w-20 h-20 text-brand-primary opacity-10" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-2">Configuración Requerida</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest max-w-sm mb-10 leading-relaxed">
                        Para comenzar a registrar tarifas en <span className="text-brand-primary underline decoration-2">{insurance.name}</span>, primero debes activar el convenio maestro.
                    </p>
                    <button 
                        onClick={handleCreateAgreement} 
                        className="px-12 py-5 bg-gray-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-black hover:scale-105 active:scale-95 transition-all"
                    >
                        Activar Tarifario Ahora
                    </button>
                </div>
            ) : (
                <>
                    <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white shrink-0 shadow-sm z-10">
                        <div className="relative w-80 group">
                            <Search className="absolute w-4 h-4 text-gray-400 left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand-primary transition-colors" />
                            <input 
                                value={filterText}
                                onChange={e => setFilterText(e.target.value)}
                                placeholder="Filtrar por nombre de servicio..." 
                                className="w-full py-3.5 pl-12 pr-6 bg-gray-50 border-transparent rounded-2xl text-xs font-bold uppercase tracking-widest focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none shadow-inner" 
                            />
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="h-10 w-px bg-gray-100"></div>
                            <div className="flex flex-col items-end">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Gestión de Tarifas para:</p>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></span>
                                    <p className="text-sm font-black text-brand-primary uppercase tracking-tight">{selectedPlan.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-gray-50/30">
                        {filteredItems.map(item => (
                            <TariffRow 
                                key={`${selectedPlanId}_${item.id}`}
                                item={item} 
                                rule={localRules[`${item.id}_${selectedPlanId || 'general'}`]}
                                onSave={(prices) => handleSaveRule(item, prices)}
                                loading={loading}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
      </div>

      {/* FOOTER FIJO */}
      <div className="p-8 bg-white border-t border-gray-100 flex justify-end gap-4 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] z-20">
          <SecondaryButton onClick={onClose} className="!px-10 !py-4 font-black text-[10px] tracking-widest uppercase text-gray-400">Descartar Cambios</SecondaryButton>
          <PrimaryButton onClick={onClose} className="!px-14 !py-4 shadow-2xl shadow-brand-primary/20 font-black text-[10px] tracking-widest uppercase">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Finalizar Auditoría
          </PrimaryButton>
      </div>

      {/* Modal para crear/editar nivel desde aquí mismo */}
      <SideModal
        open={isPlanFormOpen}
        onClose={() => {
            setIsPlanFormOpen(false);
            setPlanToEdit(null);
        }}
        width="4xl"
      >
        <PlanForm
          insurance={insurance}
          plan={planToEdit}
          sessionTypes={sessionTypes}
          onClose={() => {
            setIsPlanFormOpen(false);
            setPlanToEdit(null);
            router.reload({ only: ['insurances'] });
          }}
        />
      </SideModal>
    </div>
  );
}

/**
 * Subcomponente de Fila para manejo de estado local por ítem
 */
function TariffRow({ item, rule, onSave, loading }) {
    const [prices, setPrices] = useState({
        gross_price_clp: rule?.gross_price_clp || item.price || 0,
        patient_share_clp: rule?.patient_share_clp || 0
    });

    const [percentage, setPercentage] = useState(
        rule?.patient_percentage || 0
    );

    // --- SINCRONIZACIÓN REACTIVA CON PROPS ---
    useEffect(() => {
        setPrices({
            gross_price_clp: rule?.gross_price_clp || item.price || 0,
            patient_share_clp: rule?.patient_share_clp || 0
        });
        setPercentage(rule?.patient_percentage || 0);
    }, [rule, item.price]);

    const isChanged = useMemo(() => {
        return prices.gross_price_clp !== (rule?.gross_price_clp || item.price) || 
               prices.patient_share_clp !== (rule?.patient_share_clp || 0);
    }, [prices, rule, item.price]);

    const applyPercentage = (pct) => {
        const newPct = parseFloat(pct) || 0;
        setPercentage(newPct);
        const calculatedCopay = Math.round(prices.gross_price_clp * (newPct / 100));
        setPrices(prev => ({ ...prev, patient_share_clp: calculatedCopay }));
    };

    return (
        <div className={`bg-white border rounded-3xl p-5 flex items-center gap-6 shadow-sm transition-all group ${isChanged ? 'border-brand-primary/30 ring-4 ring-brand-primary/5' : 'border-gray-100 hover:shadow-xl'}`}>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{item.name}</p>
                    {rule && <span className="text-[7px] font-black bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100 uppercase tracking-widest">Definido</span>}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-gray-400 uppercase italic">Ref. Particular: {item.price ? Number(item.price).toLocaleString('es-CL', {style:'currency', currency:'CLP', maximumFractionDigits: 0}) : '$ 0'}</span>
                    <div className="h-1 w-1 bg-gray-200 rounded-full"></div>
                    <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">SKU: {item.sku || 'N/A'}</span>
                </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                <div className="space-y-1">
                    <label className="text-[8px] font-black text-purple-400 uppercase tracking-widest ml-1">% Copago</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            value={percentage}
                            onChange={e => applyPercentage(e.target.value)}
                            className="w-16 py-2.5 px-3 rounded-xl text-xs font-black text-center bg-purple-50 border-transparent text-purple-700 focus:ring-purple-200 outline-none"
                            placeholder="0"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-purple-300">%</span>
                    </div>
                </div>

                <div className="space-y-1 text-right">
                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest mr-1">Valor Pactado</label>
                    <InputPesoChileno 
                        price={prices.gross_price_clp}
                        onChange={e => {
                            const newGross = parseInt(e.target.value) || 0;
                            setPrices(prev => ({
                                ...prev, 
                                gross_price_clp: newGross,
                                patient_share_clp: Math.round(newGross * (percentage / 100))
                            }));
                        }}
                        className="!py-2.5 !px-4 !rounded-xl !text-xs !font-black !w-36 bg-gray-50 group-hover:bg-white border-transparent focus:border-brand-primary/20" 
                    />
                </div>
                <div className="space-y-1 text-right">
                    <label className="text-[8px] font-black text-brand-primary uppercase tracking-widest mr-1">Copago Paciente</label>
                    <InputPesoChileno 
                        price={prices.patient_share_clp}
                        onChange={e => {
                            const newCopay = parseInt(e.target.value) || 0;
                            setPrices(prev => ({...prev, patient_share_clp: newCopay}));
                            if (prices.gross_price_clp > 0) {
                                setPercentage(Math.round((newCopay / prices.gross_price_clp) * 100));
                            }
                        }}
                        className="!py-2.5 !px-4 !rounded-xl !text-xs !font-black !w-36 bg-brand-primary/5 border-brand-primary/10 focus:border-brand-primary/30" 
                    />
                </div>
                
                <button 
                    onClick={() => onSave(prices)}
                    disabled={!isChanged || loading}
                    className={`p-3 rounded-xl transition-all mt-4 border ${
                        isChanged 
                        ? 'bg-gray-900 text-white shadow-lg hover:scale-105 active:scale-95' 
                        : 'bg-gray-50 text-gray-300 border-transparent cursor-not-allowed'
                    }`}
                >
                    <Save className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
