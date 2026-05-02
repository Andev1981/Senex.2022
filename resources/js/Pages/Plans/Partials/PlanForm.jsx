import React, { useEffect, useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { 
  Plus, 
  Trash2, 
  ListCheck, 
  ShieldCheck, 
  DollarSign, 
  Calendar, 
  Briefcase,
  Users,
  CheckCircle2,
  Database,
  Hash,
  Box,
  Shield
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import Switch from "@/components/Switch";
import TextInput from "@/components/TextInput";
import EnterpriseSelect from "@/components/EnterpriseSelect";
import InputPesoChileno from "@/components/InputPesoChileno";
import Swal from "sweetalert2";

export default function PlanForm({ plan, insurance, sessionTypes, onClose }) {
  const isEdit = !!plan;
  const { props } = usePage();
  const currentCompanyId = props.current_company_id;
  
  // LÓGICA ESTRICTA: 
  // 1. Si NO hay insurance -> Es un Pack Interno de la clínica (Venta directa)
  // 2. Si HAY insurance -> Es un Plan Externo de Previsión (Identificador de cobertura)
  const isInternal = !insurance; 

  const { data, setData, post, put, processing, errors, clearErrors, reset } = useForm({
    id: plan?.id,
    company_id: currentCompanyId,
    name: plan?.name || "",
    code: plan?.code || "",
    type: isInternal ? "internal" : "external", // Forzado por contexto
    insurance_id: insurance?.id || plan?.insurance_id || null,
    billing_type: plan?.billing_type || (isInternal ? "prepaid" : "postpaid"),
    insurance_policy_type: plan?.insurance_policy_type || "complementary",
    price: plan?.price || 0,
    initial_fee: plan?.initial_fee || 0,
    valid_months: plan?.valid_months || "",
    start_date: plan?.start_date || "",
    end_date: plan?.end_date || "",
    is_family: !!plan?.is_family,
    is_active: plan ? !!plan.is_active : true,
    description: plan?.description || "",
    coverage_percentage: plan?.coverage_percentage || "",
    content: plan?.items?.map((item) => ({
      id: uuidv4(),
      session_type_id: item.id.toString(),
      max_sessions: item.pivot.max_sessions,
    })) || [],
  });

  const [showInitialFeeInput, setShowInitialFeeInput] = useState(data.initial_fee > 0);
  const [filteredSessionTypes, setFilteredSessionTypes] = useState(sessionTypes || []);

  useEffect(() => {
    if (sessionTypes) {
        const selectedIds = data.content.map(item => item.session_type_id).filter(id => id !== "");
        setFilteredSessionTypes(sessionTypes.filter(s => !selectedIds.includes(s.id.toString())));
    }
  }, [data.content, sessionTypes]);

  const addContentItem = () => {
    setData("content", [...data.content, { id: uuidv4(), session_type_id: "", max_sessions: 1 }]);
    clearErrors("content");
  };

  const updateContentItem = (index, field, value) => {
    const newContent = [...data.content];
    newContent[index][field] = value;
    setData("content", newContent);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const requestOptions = {
        onSuccess: () => {
          onClose();
          reset();
          Swal.fire({
            title: "¡Éxito!",
            text: data.id ? "Plan actualizado correctamente" : "Plan creado correctamente",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        },
    };

    if (isEdit) {
      put(route("plans.update", plan.id), requestOptions);
    } else {
      post(route("plans.store"), requestOptions);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white min-h-0">
        {/* HEADER HERO */}
        <div className="flex items-center justify-between gap-6 p-8 border-b border-gray-100 bg-gray-50/50 shrink-0">
            <div className="flex items-center gap-4">
                <div className="p-3 text-white transform shadow-xl bg-brand-primary rounded-2xl shadow-brand-primary/20 rotate-3">
                    <ListCheck className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="mb-1 text-xl font-black leading-none tracking-tight text-gray-900 uppercase">
                        {isEdit ? 'Editar Estructura de Plan' : 'Nuevo Plan / Pack'}
                    </h2>
                    <p className="text-[9px] font-black text-brand-gray uppercase tracking-[0.2em]">
                        {insurance ? `Asociado a: ${insurance.name}` : 'Configuración Maestra'}
                    </p>
                </div>
            </div>
            {isEdit && (
                <div className={`px-3 py-1 rounded-lg border flex items-center gap-2 ${data.is_active ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-widest">{data.is_active ? 'Vigente' : 'Inactivo'}</span>
                </div>
            )}
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 p-8 space-y-10 overflow-y-auto custom-scrollbar">
          
          {/* SECCIÓN 1: DEFINICIÓN ESTRATÉGICA */}
          <div className="space-y-6">
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" /> Arquitectura del Plan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-gray-100 border border-gray-100 rounded-[2rem]">
                <div className="space-y-1">
                    <EnterpriseSelect
                        label="Origen del Plan"
                        value={data.type}
                        onChange={(val) => setData("type", val)}
                        disabled={isExternalInsurance || isEdit}
                        options={[
                            { value: 'external', label: 'Externo (Isapre / Fonasa)' },
                            { value: 'internal', label: 'Interno (Clínica / Pack)' },
                        ]}
                    />
                    {isExternalInsurance && (
                      <p className="text-[9px] text-brand-primary font-bold mt-1 ml-1 uppercase italic">
                        * Restringido a Externo por tipo de institución
                      </p>
                    )}
                </div>
                <div className="space-y-1">
                    <EnterpriseSelect
                        label="Modelo de Facturación"
                        value={data.billing_type}
                        onChange={(val) => setData("billing_type", val)}
                        options={[
                            { value: 'prepaid', label: 'Prepago (Pago anticipado)' },
                            { value: 'membership', label: 'Membresía (Cuota mensual)' },
                            { value: 'postpaid', label: 'Convenio Directo (Empresa)' },
                        ]}
                    />
                </div>
            </div>
          </div>

          {/* SECCIÓN 2: INTEGRACIÓN & FAMILIA */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="p-6 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-brand-secondary/10 text-brand-primary rounded-xl">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="mb-1 text-xs font-black leading-none tracking-tight text-gray-900 uppercase">Política de Seguro</p>
                        <EnterpriseSelect
                            value={data.insurance_policy_type}
                            onChange={(val) => setData("insurance_policy_type", val)}
                            options={[
                                { value: 'complementary', label: 'Complementario' },
                                { value: 'standalone', label: 'Independiente' },
                            ]}
                            className="w-40"
                        />
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm flex items-center justify-between group cursor-pointer hover:border-brand-primary/30 transition-all">
                <div className="flex items-center gap-4">
                    <div className="p-2 text-purple-600 bg-purple-50 rounded-xl">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="mb-1 text-xs font-black leading-none tracking-tight text-gray-900 uppercase">Grupo Familiar</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">¿Permitir múltiples usuarios?</p>
                    </div>
                </div>
                <Switch checked={data.is_family} onChange={e => setData("is_family", e.target.checked)} />
            </div>
          </div>

          {/* SECCIÓN 3: PARÁMETROS ECONÓMICOS (SÓLO INTERNOS O COBERTURA EXTERNA) */}
          {data.type === "internal" ? (
            <div className="p-8 bg-brand-primary/5 border border-brand-primary/10 rounded-[2.5rem] space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-brand-primary/5 blur-3xl"></div>
                <h3 className="enterprise-label !text-brand-primary flex items-center gap-2 relative z-10">
                    <DollarSign className="w-3.5 h-3.5" /> Configuración de Precios
                </h3>
                <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-1">
                        <label className="enterprise-label !text-[8px] ml-1">Valor del Pack (CLP)</label>
                        <InputPesoChileno price={data.price} onChange={e => setData("price", e.target.value)} className="!rounded-xl !py-3 !px-4 font-black text-sm bg-white" />
                    </div>
                    <div className="space-y-1">
                        <label className="enterprise-label !text-[8px] ml-1">Vigencia (Meses)</label>
                        <input type="number" value={data.valid_months} onChange={e => setData("valid_months", e.target.value)} className="w-full px-4 py-3 text-sm font-black bg-white border-gray-100 rounded-xl focus:ring-brand-primary shadow-sm outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="enterprise-label !text-[8px] ml-1">Matrícula / Inicio</label>
                        <div className="flex items-center gap-3">
                            <Switch checked={showInitialFeeInput} onChange={e => { setShowInitialFeeInput(e.target.checked); if (!e.target.checked) setData("initial_fee", 0); }} />
                            {showInitialFeeInput && (
                                <InputPesoChileno price={data.initial_fee} onChange={e => setData("initial_fee", e.target.value)} className="!rounded-xl !py-2 !px-3 font-bold text-xs bg-white border-brand-primary/20" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
          ) : (
            <div className="p-8 bg-purple-50/50 border border-purple-100 rounded-[2.5rem] space-y-4">
                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest leading-relaxed flex items-start gap-2">
                    <Shield className="w-4 h-4 shrink-0" />
                    <span>💡 Los precios para convenios externos se definen en el <span className="font-black underline">Gestor de Convenios</span>. Este registro sirve para identificar la cobertura del paciente.</span>
                </p>
                <div className="space-y-2">
                    <label className="enterprise-label !text-purple-700 !text-[8px] ml-1">Porcentaje de Cobertura Estimada</label>
                    <TextInput type="number" step="0.01" name="coverage_percentage" value={data.coverage_percentage} onChange={e => setData("coverage_percentage", e.target.value)} placeholder="70.00" className="!bg-white !rounded-xl" />
                </div>
            </div>
          )}

          {/* SECCIÓN 4: CONTENIDO DEL PAQUETE */}
          {data.type === "internal" && data.billing_type === "prepaid" && (
            <div className="space-y-6">
                <div className="flex items-center justify-between ml-1">
                    <h3 className="enterprise-label !text-brand-primary !mb-0 flex items-center gap-2">
                        <Database className="w-3.5 h-3.5" /> Servicios Incluidos en el Pack
                    </h3>
                    <button type="button" onClick={addContentItem} className="flex items-center gap-2 text-[9px] font-black text-brand-primary uppercase tracking-widest bg-brand-secondary/10 px-4 py-2 rounded-xl hover:bg-brand-primary hover:text-white transition-all">
                        <Plus className="w-3.5 h-3.5" /> Añadir Prestación
                    </button>
                </div>

                <div className="space-y-3">
                    {data.content.map((item, index) => (
                        <div key={item.id} className="grid items-end grid-cols-1 gap-4 p-4 transition-all bg-white border border-gray-100 shadow-sm md:grid-cols-12 rounded-2xl group hover:border-brand-primary/30">
                            <div className="space-y-1 md:col-span-10">
                                <EnterpriseSelect
                                    label="Servicio Autorizado"
                                    value={item.session_type_id}
                                    onChange={(val) => updateContentItem(index, "session_type_id", val)}
                                    options={[
                                        ...filteredSessionTypes.map(s => ({ value: s.id.toString(), label: s.name })),
                                        ...(item.session_type_id && !filteredSessionTypes.find(s => s.id.toString() === item.session_type_id) 
                                            ? [{ value: item.session_type_id, label: sessionTypes.find(s => s.id.toString() === item.session_type_id)?.name }] 
                                            : [])
                                    ]}
                                    placeholder="Seleccione..."
                                />
                            </div>
                            <div className="space-y-1 md:col-span-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center block leading-none mb-2">Cant.</label>
                                <input type="number" value={item.max_sessions} onChange={e => updateContentItem(index, "max_sessions", e.target.value)} className="w-full rounded-xl border-gray-50 bg-gray-50/50 py-2.5 px-2 text-center text-xs font-black outline-none" />
                            </div>
                            <div className="flex justify-center pb-1 md:col-span-1">
                                <button type="button" onClick={() => setData("content", data.content.filter(i => i.id !== item.id))} className="p-2 text-gray-300 transition-all rounded-lg hover:text-red-500 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {data.content.length === 0 && (
                        <div className="py-10 text-center border-2 border-gray-100 border-dashed rounded-3xl opacity-30">
                            <Database className="w-10 h-10 mx-auto mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Sin prestaciones configuradas</p>
                        </div>
                    )}
                </div>
            </div>
          )}

          {/* SECCIÓN 5: INFORMACIÓN TÉCNICA */}
          <div className="grid grid-cols-1 gap-8 pt-8 border-t border-gray-100 md:grid-cols-3">
            <div className="space-y-6 md:col-span-2">
                <div className="space-y-1">
                    <label className="ml-1 enterprise-label opacity-60">Nombre Comercial del Plan</label>
                    <TextInput value={data.name} onChange={e => setData("name", e.target.value)} required className="w-full !rounded-2xl !py-4 font-black uppercase text-sm" placeholder="EJ: PACK 10 SESIONES KINESIOLOGÍA" />
                </div>
                <div className="space-y-1">
                    <label className="ml-1 enterprise-label opacity-60">Descripción / Glosa Interna</label>
                    <textarea rows="3" value={data.description} onChange={e => setData("description", e.target.value)} className="w-full px-5 py-4 text-xs font-medium transition-all border-gray-100 shadow-inner resize-none rounded-2xl bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none" placeholder="Notas sobre el alcance del convenio..." />
                </div>
            </div>
            <div className="space-y-6">
                <div className="space-y-1">
                    <label className="ml-1 enterprise-label opacity-60">Código Interno</label>
                    <div className="relative">
                        <Hash className="absolute w-4 h-4 -translate-y-1/2 left-4 top-1/2 text-brand-gray opacity-40" />
                        <input type="text" value={data.code} onChange={e => setData("code", e.target.value.toUpperCase())} className="w-full py-4 pl-12 pr-4 font-mono text-sm font-black transition-all border-gray-100 shadow-inner rounded-2xl bg-gray-50 focus:bg-white focus:ring-brand-primary outline-none" placeholder="PLN-001" />
                    </div>
                </div>
                <div className="flex items-center justify-between p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${data.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none">Estado</p>
                    </div>
                    <Switch checked={data.is_active} onChange={e => setData("is_active", e.target.checked)} />
                </div>
            </div>
          </div>

          {/* SECCIÓN 6: VIGENCIA DE LA OFERTA */}
          <div className="p-8 bg-amber-50/50 border border-amber-100 rounded-[2.5rem] space-y-6">
            <h3 className="enterprise-label !text-amber-700 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> Disponibilidad en Catálogo
            </h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-1">
                    <label className="enterprise-label !text-amber-800 !text-[8px] ml-1">Apertura</label>
                    <input type="date" value={data.start_date} onChange={e => setData("start_date", e.target.value)} className="w-full px-4 py-3 font-mono text-xs font-bold bg-white rounded-2xl border-amber-100 focus:ring-amber-500 outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label !text-amber-800 !text-[8px] ml-1">Cierre / Caducidad</label>
                    <input type="date" value={data.end_date} onChange={e => setData("end_date", e.target.value)} className="w-full px-4 py-3 font-mono text-xs font-bold bg-white rounded-2xl border-amber-100 focus:ring-amber-500 outline-none" />
                </div>
            </div>
          </div>
        </div>

        {/* FOOTER FIJO PREMIUM */}
        <div className="p-8 bg-gray-50/80 backdrop-blur border-t border-gray-100 flex justify-end gap-4 shrink-0 rounded-b-[2rem] mt-auto">
            <SecondaryButton onClick={() => { reset(); onClose(); }} className="!px-10 !py-4">Descartar</SecondaryButton>
            <PrimaryButton disabled={processing} type="submit" className="!px-14 !py-4 shadow-xl shadow-brand-primary/20">
                {processing ? 'Sincronizando...' : (isEdit ? 'Actualizar Plan' : 'Confirmar & Crear Plan')}
            </PrimaryButton>
        </div>
    </form>
  );
}
