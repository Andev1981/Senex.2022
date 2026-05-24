import React, { useMemo, useState } from "react";
import { Settings, Percent, DollarSign, Plus, Edit2, Trash2, ShieldAlert, Search, CircleDot, CheckCircle2 } from "lucide-react";
import SideModal from "@/components/SideModal";
import { useForm } from "@inertiajs/react";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import InputPesoChileno from "@/components/InputPesoChileno";
import TextInputNumber from "@/components/TextInputNumber";
import Swal from "sweetalert2";

export default function DoctorConfig({ doctor, session_types }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRate, setSelectedRate] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const { data, setData, post, processing, reset } = useForm({
        session_type_id: null,
        percentage: 0,
        commission_percentage_own: 0,
        commission_percentage_assigned: 0,
        fixed_amount_clp: 0,
        amount_clp_own: 0,
        amount_clp_assigned: 0,
        commission_type: 'fixed_amount'
    });

    const formatMoney = (amount) => {
        const val = Number(amount) || 0;
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
    };

    const effectiveRates = useMemo(() => {
        const rates = session_types.map(st => {
            const customRate = (doctor.commission_rates || []).find(r => r.session_type_id === st.id);
            const basePrice = Number(st.base_price_clp) || 0;
            const globalDefaultComm = Number(st.default_doctor_commission_clp) || 0;

            let commOwn = globalDefaultComm;
            let commAssigned = globalDefaultComm;

            if (customRate) {
                if (customRate.commission_type === 'fixed_amount') {
                    commOwn = Number(customRate.amount_clp_own) || Number(customRate.amount_clp) || 0;
                    commAssigned = Number(customRate.amount_clp_assigned) || Number(customRate.amount_clp) || 0;
                } else {
                    const pOwn = customRate.commission_percentage_own ?? customRate.commission_percentage ?? 0;
                    const pAssigned = customRate.commission_percentage_assigned ?? customRate.commission_percentage ?? 0;
                    
                    commOwn = Math.round(basePrice * (Number(pOwn) / 100));
                    commAssigned = Math.round(basePrice * (Number(pAssigned) / 100));
                }
            }

            return {
                ...st,
                is_custom: !!customRate,
                comm_own_clp: commOwn,
                comm_assigned_clp: commAssigned,
                custom_data: customRate
            };
        });

        // Aplicar Filtro de Búsqueda
        if (!searchTerm) return rates;
        return rates.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [doctor.commission_rates, session_types, searchTerm]);

    const handleEdit = (rate) => {
        setSelectedRate(rate);
        setData({
            session_type_id: rate.id,
            percentage: Number(rate.custom_data?.commission_percentage) || 0,
            commission_percentage_own: Number(rate.custom_data?.commission_percentage_own) || Number(rate.custom_data?.commission_percentage) || 0,
            commission_percentage_assigned: Number(rate.custom_data?.commission_percentage_assigned) || Number(rate.custom_data?.commission_percentage) || 0,
            fixed_amount_clp: Number(rate.custom_data?.amount_clp) || 0,
            amount_clp_own: Number(rate.custom_data?.amount_clp_own) || Number(rate.custom_data?.amount_clp) || 0,
            amount_clp_assigned: Number(rate.custom_data?.amount_clp_assigned) || Number(rate.custom_data?.amount_clp) || 0,
            commission_type: rate.custom_data?.commission_type || 'fixed_amount'
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const payload = {
            rules: [{
                item_id: data.session_type_id,
                commission_type: data.commission_type,
                amount_clp: data.fixed_amount_clp,
                amount_clp_own: data.amount_clp_own,
                amount_clp_assigned: data.amount_clp_assigned,
                commission_percentage: data.percentage,
                commission_percentage_own: data.commission_percentage_own,
                commission_percentage_assigned: data.commission_percentage_assigned
            }]
        };

        post(route('doctors.commissions.update', doctor.id), {
            data: payload,
            onSuccess: () => {
                setIsModalOpen(false);
                Swal.fire('¡Éxito!', 'Tarifa configurada correctamente.', 'success');
            }
        });
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-secondary/30 rounded-xl text-brand-primary">
                            <Settings className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Tarifario de Especialista</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resumen de comisiones por tipo de atención</p>
                        </div>
                    </div>

                    {/* BUSCADOR INTEGRADO */}
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                        <input 
                            type="text"
                            placeholder="Filtrar servicios..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-brand-primary transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-hidden border border-gray-100 rounded-3xl shadow-inner bg-gray-50/30">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-left text-[9px] font-black text-brand-gray uppercase tracking-widest">Servicio</th>
                                <th className="px-6 py-4 text-center text-[9px] font-black text-brand-gray uppercase tracking-widest">Origen</th>
                                <th className="px-6 py-4 text-right text-[9px] font-black text-brand-gray uppercase tracking-widest">Pago Propio</th>
                                <th className="px-6 py-4 text-right text-[9px] font-black text-brand-gray uppercase tracking-widest">Pago Asignado</th>
                                <th className="px-6 py-4 text-right text-[9px] font-black text-brand-gray uppercase tracking-widest">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {effectiveRates.map((rate) => (
                                <tr key={rate.id} className="hover:bg-white transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-black text-gray-700 uppercase">{rate.name}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {rate.is_custom ? (
                                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[8px] font-black uppercase rounded-lg border border-amber-200 shadow-sm">Personalizado</span>
                                        ) : (
                                            <span className="px-3 py-1 bg-gray-100 text-gray-400 text-[8px] font-black uppercase rounded-lg border border-gray-200">Global</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`text-xs font-bold font-mono ${rate.is_custom ? 'text-brand-primary' : 'text-gray-600'}`}>
                                            {formatMoney(rate.comm_own_clp)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`text-xs font-bold font-mono ${rate.is_custom ? 'text-brand-primary' : 'text-gray-600'}`}>
                                            {formatMoney(rate.comm_assigned_clp)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleEdit(rate)}
                                                className={`p-2 rounded-lg transition-all ${rate.is_custom ? 'text-brand-primary bg-brand-secondary/20 hover:scale-110' : 'text-gray-300 hover:text-brand-primary'}`}
                                                title={rate.is_custom ? "Editar Excepción" : "Crear Excepción"}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DE EDICIÓN DE TARIFA */}
            <SideModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Configurar Comisión"
                subtitle={selectedRate?.name}
                icon={DollarSign}
                footer={
                    <>
                        <SecondaryButton onClick={() => setIsModalOpen(false)}>Cancelar</SecondaryButton>
                        <PrimaryButton onClick={handleSubmit} disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar Cambios'}
                        </PrimaryButton>
                    </>
                }
            >
                <div className="space-y-8">
                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
                        <ShieldAlert className="w-5 h-5 text-blue-600 mt-1" />
                        <div>
                            <p className="text-xs font-bold text-blue-900 uppercase">Aviso de Configuración</p>
                            <p className="text-[10px] text-blue-700 leading-relaxed mt-1">
                                Elige el método de cálculo. Si el valor del método activo es 0, el profesional heredará la tarifa global.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* OPCION 1: MONTO FIJO */}
                        <button 
                            type="button"
                            onClick={() => setData('commission_type', 'fixed_amount')}
                            className={`p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden group ${data.commission_type === 'fixed_amount' ? 'border-brand-primary bg-brand-primary/5 shadow-lg shadow-brand-primary/10' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${data.commission_type === 'fixed_amount' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                {data.commission_type === 'fixed_amount' && <CheckCircle2 className="w-5 h-5 text-brand-primary" />}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Método 1</p>
                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Monto Fijo</p>
                        </button>

                        {/* OPCION 2: PORCENTAJE */}
                        <button 
                            type="button"
                            onClick={() => setData('commission_type', 'percentage')}
                            className={`p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden group ${data.commission_type === 'percentage' ? 'border-brand-primary bg-brand-primary/5 shadow-lg shadow-brand-primary/10' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${data.commission_type === 'percentage' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                                    <Percent className="w-5 h-5" />
                                </div>
                                {data.commission_type === 'percentage' && <CheckCircle2 className="w-5 h-5 text-brand-primary" />}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Método 2</p>
                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Porcentaje</p>
                        </button>
                    </div>

                    <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-[2.5rem] space-y-6">
                        <div className="space-y-4">
                            <div className={`space-y-4 transition-all ${data.commission_type === 'fixed_amount' ? 'opacity-100 scale-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                                <div className="space-y-2">
                                    <label className="enterprise-label ml-1">Monto Paciente Propio ($)</label>
                                    <InputPesoChileno 
                                        price={data.amount_clp_own}
                                        onChange={(e) => {
                                            const valStr = String(e.target.value).replace(/[^0-9]/g, "");
                                            const priceLimit = String(selectedRate?.base_price_clp || 0).replace(/[^0-9]/g, "").length;
                                            if (valStr.length <= priceLimit) setData('amount_clp_own', e.target.value);
                                        }}
                                        className="w-full !rounded-2xl !py-4 !px-5 font-black text-lg bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="enterprise-label ml-1">Monto Paciente Asignado ($)</label>
                                    <InputPesoChileno 
                                        price={data.amount_clp_assigned}
                                        onChange={(e) => {
                                            const valStr = String(e.target.value).replace(/[^0-9]/g, "");
                                            const priceLimit = String(selectedRate?.base_price_clp || 0).replace(/[^0-9]/g, "").length;
                                            if (valStr.length <= priceLimit) setData('amount_clp_assigned', e.target.value);
                                        }}
                                        className="w-full !rounded-2xl !py-4 !px-5 font-black text-lg bg-white"
                                    />
                                </div>
                            </div>

                            <div className={`space-y-4 transition-all ${data.commission_type === 'percentage' ? 'opacity-100 scale-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                                <div className="space-y-2">
                                    <label className="enterprise-label ml-1">Comisión Paciente Propio (%)</label>
                                    <div className="relative">
                                        <TextInputNumber 
                                            value={data.commission_percentage_own}
                                            onChange={(e) => {
                                                const valStr = String(e.target.value);
                                                const val = parseFloat(e.target.value);
                                                if ((valStr.length <= 3 && val <= 100) || e.target.value === "") setData('commission_percentage_own', e.target.value);
                                            }}
                                            className="w-full !rounded-2xl !py-4 !pl-5 !pr-12 font-black text-lg bg-white"
                                            placeholder="0"
                                            min={0}
                                            max={100}
                                        />
                                        <Percent className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="enterprise-label ml-1">Comisión Paciente Asignado (%)</label>
                                    <div className="relative">
                                        <TextInputNumber 
                                            value={data.commission_percentage_assigned}
                                            onChange={(e) => {
                                                const valStr = String(e.target.value);
                                                const val = parseFloat(e.target.value);
                                                if ((valStr.length <= 3 && val <= 100) || e.target.value === "") setData('commission_percentage_assigned', e.target.value);
                                            }}
                                            className="w-full !rounded-2xl !py-4 !pl-5 !pr-12 font-black text-lg bg-white"
                                            placeholder="0"
                                            min={0}
                                            max={100}
                                        />
                                        <Percent className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Resultado Estimado (Máximo)</p>
                        <div className="p-6 bg-brand-primary text-white rounded-3xl flex justify-between items-center shadow-xl shadow-brand-primary/20">
                            <div>
                                <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">El profesional recibirá hasta</p>
                                <p className="text-2xl font-black font-mono tracking-tighter">
                                    {data.commission_type === 'fixed_amount' 
                                        ? formatMoney(data.fixed_amount_clp) 
                                        : formatMoney(Math.round((Number(selectedRate?.base_price_clp) || 0) * (Math.max(data.commission_percentage_own, data.commission_percentage_assigned) / 100)))
                                    }
                                </p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-2xl">
                                <DollarSign className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </SideModal>
        </div>
    );
}
