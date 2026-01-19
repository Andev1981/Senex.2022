import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Percent, 
  Save, 
  Loader2, 
  Stethoscope, 
  DollarSign,
  Database,
  CheckCircle2
} from "lucide-react";
import { fmtCLP } from "@/utils/utils";
import Swal from "sweetalert2";
import InputPesoChileno from "@/components/InputPesoChileno";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

export default function DoctorCommissions({ doctor, sessionTypes }) {
  const [localDoctor, setLocalDoctor] = useState(doctor);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [commissionDraft, setCommissionDraft] = useState({});

  useEffect(() => {
    if (doctor) setLocalDoctor(doctor);
  }, [doctor?.id]);

  const getRuleDisplay = (summaryItem) => {
    const stId = summaryItem.session_type_id;
    if (commissionDraft[stId]) return { ...commissionDraft[stId], is_dirty: true };
    return {
      is_customized: summaryItem.is_customized,
      current_value: summaryItem.current_value,
      default_value: summaryItem.default_value,
    };
  };

  const setDraft = (stId, value) => {
    setCommissionDraft(prev => {
      const original = localDoctor.rates_summary.find(r => r.session_type_id === stId);
      return { ...prev, [stId]: { value: value } };
    });
  };

  const saveRules = async () => {
    setIsSaving(true);
    const rules = Object.entries(commissionDraft).map(([stId, draft]) => {
      const numValue = draft.value === "" ? null : Number(String(draft.value).replace(/[^0-9.]/g, ""));
      return { session_type_id: Number(stId), type: "fixed_amount", value: numValue };
    });

    try {
      const response = await axios.post(route("doctors.commission-rules.update", localDoctor.id), { rules });
      if (response.data.success) {
        setLocalDoctor(prev => ({ ...prev, rates_summary: response.data.updated_summary }));
        setIsEditing(false);
        setCommissionDraft({});
        Swal.fire({ icon: "success", title: "Tarifario Actualizado", showConfirmButton: false, timer: 1500 });
      }
    } catch (e) { Swal.fire({ icon: "error", title: "Error al guardar" }); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500">
      <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-primary text-white rounded-2xl shadow-xl shadow-brand-primary/20 transform rotate-3">
                <Percent className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none mb-1">Estructura de Comisiones</h2>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">Acuerdos de Pago: {localDoctor.full_name}</p>
            </div>
        </div>
        <div className=" pr-20">
        {!isEditing ? (
            <PrimaryButton onClick={() => setIsEditing(true)} className="!text-[9px] !py-3">Editar Tarifas</PrimaryButton>
        ) : (
            <div className="flex gap-2">
                <SecondaryButton onClick={() => { setIsEditing(false); setCommissionDraft({}); }} className="!text-[9px] !py-3">Cancelar</SecondaryButton>
                <PrimaryButton onClick={saveRules} disabled={isSaving} className="!text-[9px] !py-3 shadow-lg shadow-brand-primary/20">
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Guardar
                </PrimaryButton>
            </div>
        )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="bg-white border border-gray-100 shadow-xl rounded-[2rem] overflow-hidden">
            <table className="w-full border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-gray">
                        <th className="px-8 py-5 text-left">Prestación / Servicio</th>
                        <th className="px-8 py-5 text-right">Comisión Base</th>
                        <th className="px-8 py-5 text-right w-48">Tarifa Profesional</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {localDoctor.rates_summary?.map((item) => {
                        const rule = getRuleDisplay(item);
                        return (
                            <tr key={item.session_type_id} className="hover:bg-brand-secondary/5 transition-all">
                                <td className="px-8 py-4">
                                    <p className="text-xs font-black text-gray-800 uppercase tracking-tight">{item.name}</p>
                                    <p className="text-[9px] font-bold text-brand-gray opacity-60">PVP Paciente: {fmtCLP(item.price_to_patient)}</p>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <span className="font-mono text-xs font-bold text-gray-400">{fmtCLP(item.default_value)}</span>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    {isEditing ? (
                                        <InputPesoChileno
                                            price={rule.value}
                                            onChange={e => setDraft(item.session_type_id, e.target.value)}
                                            className={`!py-2 !px-3 !rounded-xl !text-right font-black !text-xs ${rule.value ? 'bg-brand-primary/5 border-brand-primary/30 text-brand-primary' : 'bg-gray-50 border-gray-100'}`}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-end">
                                            <span className={`text-sm font-black font-mono ${rule.is_customized ? 'text-brand-primary' : 'text-gray-600'}`}>
                                                {fmtCLP(rule.is_customized ? rule.current_value : item.default_value)}
                                            </span>
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${rule.is_customized ? 'bg-brand-primary text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                                                {rule.is_customized ? 'Especial' : 'Estándar'}
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
    </div>
  );
}
