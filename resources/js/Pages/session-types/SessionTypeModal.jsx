import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import {
  Calendar,
  FileText,
  Activity,
  Tag,
  Hash,
  Stethoscope,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  DollarSign
} from "lucide-react";
import InputLabel from "@/components/InputLabel";
import InputError from "@/components/InputError";
import TextInput from "@/components/TextInput";
import InputPesoChileno from "@/components/InputPesoChileno";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import Switch from "@/components/Switch";
import Swal from "sweetalert2";

const CATEGORIES = [
  { value: "kinesiology", label: "Kinesiología" },
  { value: "evaluation", label: "Evaluación" },
  { value: "procedure", label: "Procedimiento" },
  { value: "massage", label: "Masaje" },
  { value: "other", label: "Otro" },
];

export default function SessionTypeModal({ setIsModalOpen, selectedType }) {
  const isEdit = !!selectedType?.id;

  const { data, setData, put, post, processing, errors, reset } = useForm({
    id: selectedType?.id || "",
    name: selectedType?.name || "",
    code: selectedType?.code || "",
    category: selectedType?.category || "",
    base_price_clp: selectedType?.base_price_clp || 0,
    plan_discount_clp: selectedType?.plan_discount_clp || 0,
    duration_minutes: selectedType?.duration_minutes || 45,
    default_doctor_commission_clp: selectedType?.default_doctor_commission_clp || 0,
    requires_diagnosis: !!selectedType?.requires_diagnosis,
    requires_referral: !!selectedType?.requires_referral,
    is_active: selectedType ? !!selectedType.is_active : true,
  });

  useEffect(() => {
    if (selectedType) {
      setData({
        id: selectedType.id,
        name: selectedType.name || "",
        code: selectedType.code || "",
        category: selectedType.category || "",
        base_price_clp: selectedType.base_price_clp || 0,
        plan_discount_clp: selectedType.plan_discount_clp || 0,
        duration_minutes: selectedType.duration_minutes || 45,
        default_doctor_commission_clp: selectedType.default_doctor_commission_clp || 0,
        requires_diagnosis: !!selectedType.requires_diagnosis,
        requires_referral: !!selectedType.requires_referral,
        is_active: !!selectedType.is_active,
      });
    }
  }, [selectedType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = isEdit ? route("session-types.update", selectedType.id) : route("session-types.store");
    const method = isEdit ? put : post;

    method(url, {
      onSuccess: () => {
        setIsModalOpen(false);
        reset();
        Swal.fire({
          title: isEdit ? "¡Actualizado!" : "¡Configurado!",
          text: `Servicio ${isEdit ? 'actualizado' : 'creado'} con éxito.`,
          icon: "success",
          confirmButtonColor: "#3292b3",
          timer: 2000,
        });
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* HEADER HERO ENTERPRISE */}
        <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex items-center gap-6 shrink-0 rounded-t-[2rem]">
            <div className="p-3 bg-brand-primary text-white rounded-2xl shadow-lg shadow-brand-primary/20 transform rotate-3">
                <Database className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none mb-1">
                    {isEdit ? 'Configuración de Protocolo' : 'Nueva Prestación'}
                </h2>
                <p className="text-[9px] font-black text-brand-gray uppercase tracking-[0.2em]">Centro de Mando de Servicios</p>
            </div>
        </div>

        {/* CONTENIDO CON SCROLL */}
        <div className="p-8 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
          
          {/* IDENTIDAD DEL SERVICIO (ESTADO INTEGRADO) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-secondary/10 rounded-xl text-brand-primary">
                        <Tag className="w-4 h-4" />
                    </div>
                    <h3 className="enterprise-label !mb-0 text-brand-primary font-black uppercase tracking-widest">Identidad del Servicio</h3>
                </div>
                
                {/* SWITCH DE ESTADO INTEGRADO AQUÍ */}
                <div className={`px-4 py-2 rounded-xl border flex items-center gap-4 transition-all duration-500 ${data.is_active ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex flex-col items-end">
                        <p className={`text-[8px] font-black uppercase tracking-widest leading-none mb-1 ${data.is_active ? 'text-green-600' : 'text-red-600'}`}>Visibilidad</p>
                        <p className={`text-[10px] font-black uppercase tracking-tight leading-none ${data.is_active ? 'text-green-900' : 'text-red-900'}`}>{data.is_active ? 'Activo' : 'Baja'}</p>
                    </div>
                    <Switch checked={data.is_active} onChange={e => setData("is_active", e.target.checked)} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 space-y-1">
                    <label className="enterprise-label !text-[8px] ml-1 opacity-60">Nombre Comercial</label>
                    <TextInput
                        value={data.name}
                        onChange={e => setData("name", e.target.value)}
                        required
                        className="w-full !rounded-xl !py-3 font-bold uppercase text-xs shadow-inner"
                        placeholder="EJ: KINESIOLOGÍA DEPORTIVA"
                    />
                    <InputError message={errors.name} />
                </div>
                <div className="md:col-span-4 space-y-1">
                    <label className="enterprise-label !text-[8px] ml-1 opacity-60">Código</label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gray opacity-40" />
                        <input
                            type="text"
                            value={data.code}
                            onChange={e => setData("code", e.target.value.toUpperCase())}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-gray-100 bg-gray-50 font-mono font-bold text-xs uppercase focus:bg-white focus:ring-brand-primary transition-all shadow-inner"
                            placeholder="KINE-001"
                        />
                    </div>
                </div>
                <div className="md:col-span-6 space-y-1">
                    <label className="enterprise-label !text-[8px] ml-1 opacity-60">Categoría Operativa</label>
                    <select
                        value={data.category}
                        onChange={e => setData("category", e.target.value)}
                        className="w-full rounded-xl border-gray-100 py-3 px-4 font-bold text-xs focus:ring-brand-primary transition-all bg-gray-50/50 shadow-inner"
                        required
                    >
                        <option value="">-- Seleccione --</option>
                        {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                    </select>
                </div>
                <div className="md:col-span-6 space-y-1">
                    <label className="enterprise-label !text-[8px] ml-1 opacity-60">Tiempo Estimado</label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gray opacity-40" />
                        <input
                            type="number"
                            min="15"
                            step="15"
                            value={data.duration_minutes}
                            onChange={e => setData("duration_minutes", parseInt(e.target.value))}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-gray-100 bg-gray-50 font-bold text-xs focus:bg-white focus:ring-brand-primary shadow-inner"
                            required
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-brand-gray uppercase">Min</span>
                    </div>
                </div>
            </div>
          </div>

          {/* PARÁMETROS ECONÓMICOS */}
          <div className="p-8 bg-brand-secondary/5 border border-brand-secondary/10 rounded-[2.5rem] space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
            
            <div className="flex items-center gap-3 relative z-10">
                <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                    <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="enterprise-label !text-brand-primary !mb-0 font-black uppercase tracking-widest">Valores & Comisiones</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-1">
                    <label className="enterprise-label !text-[8px] ml-1">Precio PVP (Particular)</label>
                    <InputPesoChileno
                        price={data.base_price_clp}
                        onChange={e => setData("base_price_clp", e.target.value)}
                        required
                        className="!rounded-xl !py-3 !px-4 font-black text-sm bg-white shadow-sm border-gray-100"
                    />
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label !text-[8px] !text-purple-600 ml-1">Pago Profesional</label>
                    <div className="relative">
                        <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                        <InputPesoChileno
                            price={data.default_doctor_commission_clp}
                            onChange={e => setData("default_doctor_commission_clp", e.target.value)}
                            required
                            className="!pl-10 !rounded-xl !py-3 !px-4 font-black text-sm bg-white shadow-sm border-purple-100 text-purple-700"
                        />
                    </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                    <label className="enterprise-label !text-[8px] ml-1 opacity-40">Bonificación Plan (Descuento)</label>
                    <InputPesoChileno
                        price={data.plan_discount_clp}
                        onChange={e => setData("plan_discount_clp", e.target.value)}
                        className="!rounded-xl !py-3 !px-4 font-bold text-xs bg-gray-50/50 border-gray-100"
                    />
                </div>
            </div>
          </div>

          {/* REGLAS OPERATIVAS */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                    <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="enterprise-label !mb-0 text-brand-primary font-black uppercase tracking-widest">Normativa del Servicio</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[1.5rem] cursor-pointer hover:border-brand-primary/30 transition-all group shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-brand-primary/10 transition-colors">
                            <Activity className="w-4 h-4 text-brand-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-900 uppercase leading-none mb-1">Diagnóstico</p>
                            <p className="text-[8px] font-bold text-gray-400 uppercase">Vincular CIE-10</p>
                        </div>
                    </div>
                    <input type="checkbox" checked={data.requires_diagnosis} onChange={e => setData("requires_diagnosis", e.target.checked)} className="w-6 h-6 rounded-lg border-gray-200 text-brand-primary focus:ring-brand-primary" />
                </label>

                <label className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[1.5rem] cursor-pointer hover:border-brand-primary/30 transition-all group shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-brand-primary/10 transition-colors">
                            <FileText className="w-4 h-4 text-brand-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-900 uppercase leading-none mb-1">Derivación</p>
                            <p className="text-[8px] font-bold text-gray-400 uppercase">Orden Médica</p>
                        </div>
                    </div>
                    <input type="checkbox" checked={data.requires_referral} onChange={e => setData("requires_referral", e.target.checked)} className="w-6 h-6 rounded-lg border-gray-200 text-brand-primary focus:ring-brand-primary" />
                </label>
            </div>
          </div>
        </div>

        {/* FOOTER FIJO PREMIUM */}
        <div className="p-8 bg-gray-50/80 backdrop-blur border-t border-gray-100 flex justify-end gap-4 shrink-0 rounded-b-[2rem]">
            <SecondaryButton onClick={() => { reset(); setIsModalOpen(false); }} className="!px-10 !py-4">Descartar</SecondaryButton>
            <PrimaryButton disabled={processing} type="submit" className="!px-14 !py-4 shadow-xl shadow-brand-primary/20">
                {processing ? 'Sincronizando...' : (isEdit ? 'Actualizar Ficha' : 'Crear Prestación')}
            </PrimaryButton>
        </div>
      </form>
    </div>
  );
}