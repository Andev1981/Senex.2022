import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { 
  Package, 
  Barcode, 
  DollarSign, 
  ShieldCheck, 
  Database, 
  AlertTriangle,
  Tag,
  CheckCircle2,
  Boxes,
  Monitor,
  Layers,
  Clock,
  Stethoscope,
  Activity,
  FileText,
  Percent,
  Globe,
  Home,
  Palette,
  Users2,
  Info,
  MapPin
} from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import TextInput from "@/components/TextInput";
import TextInputNumber from "@/components/TextInputNumber";
import InputPesoChileno from "@/components/InputPesoChileno";
import Switch from "@/components/Switch";
import Checkbox from "@/components/Checkbox";
import Swal from "sweetalert2";
import InputError from "@/components/InputError";

export default function ProductModal({ isOpen, onClose, product = null, categories = [], initialType = "product", activeBranch = null }) {
  const isEdit = !!product?.id;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    id: product?.id || "",
    type: product?.type || initialType,
    category_id: product?.category_id || "",
    name: product?.name || "",
    description: product?.description || "",
    sku: product?.sku || "",
    // Campos de Producto
    barcode: product?.product_detail?.barcode || "",
    cost_price: product?.product_detail?.cost_price || 0,
    price: product?.price || 0,
    stock: product?.product_detail?.stock || 0,
    critical_stock: product?.product_detail?.critical_stock || 5,
    manage_stock: product ? !!product.product_detail?.manage_stock : true,
    // Campos de Servicio
    duration_minutes: product?.service_detail?.duration_minutes || 45,
    commission_type: product?.service_detail?.commission_type || 'fixed_amount',
    default_doctor_commission_clp: product?.service_detail?.default_doctor_commission_clp || 0,
    default_doctor_commission_own_clp: product?.service_detail?.default_doctor_commission_own_clp || product?.service_detail?.default_doctor_commission_clp || 0,
    default_doctor_commission_assigned_clp: product?.service_detail?.default_doctor_commission_assigned_clp || product?.service_detail?.default_doctor_commission_clp || 0,
    default_doctor_commission_percentage: product?.service_detail?.default_doctor_commission_percentage || 0,
    default_doctor_commission_own_percentage: product?.service_detail?.default_doctor_commission_own_percentage || product?.service_detail?.default_doctor_commission_percentage || 0,
    default_doctor_commission_assigned_percentage: product?.service_detail?.default_doctor_commission_assigned_percentage || product?.service_detail?.default_doctor_commission_percentage || 0,
    requires_diagnosis: !!product?.service_detail?.requires_diagnosis,
    requires_referral: !!product?.service_detail?.requires_referral,
    specialty: product?.service_detail?.specialty || "",
    billing_code: product?.service_detail?.billing_code || "",
    agenda_color: product?.service_detail?.agenda_color || "#3b82f6",
    patient_instructions: product?.service_detail?.patient_instructions || "",
    allows_onsite: product ? !!product.service_detail?.allows_onsite : true,
    allows_online: !!product?.service_detail?.allows_online,
    allows_home: !!product?.service_detail?.allows_home,
    max_simultaneous_patients: product?.service_detail?.max_simultaneous_patients || 3,
    requires_consent: !!product?.service_detail?.requires_consent,
    // Comunes
    is_exempt: product ? !!product.is_exempt : true,
    is_active: product ? !!product.is_active : true,
  });

  useEffect(() => {
    if (product) {
      setData({
        id: product.id,
        type: product.type || "product",
        category_id: product.category_id || "",
        name: product.name || "",
        description: product.description || "",
        sku: product.sku || "",
        barcode: product.product_detail?.barcode || "",
        cost_price: Math.round(product.product_detail?.cost_price || 0),
        price: Math.round(product.price || 0),
        stock: Math.round(product.product_detail?.stock || 0),
        critical_stock: Math.round(product.product_detail?.critical_stock || 5),
        manage_stock: !!product.product_detail?.manage_stock,
        duration_minutes: Math.round(product.service_detail?.duration_minutes || 45),
        commission_type: product.service_detail?.commission_type || 'fixed_amount',
        default_doctor_commission_clp: Math.round(product.service_detail?.default_doctor_commission_clp || 0),
        default_doctor_commission_own_clp: Math.round(product.service_detail?.default_doctor_commission_own_clp || product.service_detail?.default_doctor_commission_clp || 0),
        default_doctor_commission_assigned_clp: Math.round(product.service_detail?.default_doctor_commission_assigned_clp || product.service_detail?.default_doctor_commission_clp || 0),
        default_doctor_commission_percentage: Number(product.service_detail?.default_doctor_commission_percentage) || 0,
        default_doctor_commission_own_percentage: Number(product.service_detail?.default_doctor_commission_own_percentage) || Number(product.service_detail?.default_doctor_commission_percentage) || 0,
        default_doctor_commission_assigned_percentage: Number(product.service_detail?.default_doctor_commission_assigned_percentage) || Number(product.service_detail?.default_doctor_commission_percentage) || 0,
        requires_diagnosis: !!product.service_detail?.requires_diagnosis,
        requires_referral: !!product.service_detail?.requires_referral,
        specialty: product.service_detail?.specialty || "",
        billing_code: product.service_detail?.billing_code || "",
        agenda_color: product.service_detail?.agenda_color || "#3b82f6",
        patient_instructions: product.service_detail?.patient_instructions || "",
        allows_onsite: !!product.service_detail?.allows_onsite,
        allows_online: !!product.service_detail?.allows_online,
        allows_home: !!product.service_detail?.allows_home,
        max_simultaneous_patients: product.service_detail?.max_simultaneous_patients || 3,
        requires_consent: !!product.service_detail?.requires_consent,
        is_exempt: !!product.is_exempt,
        is_active: !!product.is_active,
      });
    } else {
        reset();
        setData("type", initialType);
    }
  }, [product, initialType]);

  const submit = (e) => {
    e.preventDefault();
    const url = isEdit ? route("products.update", product.id) : route("products.store");
    const method = isEdit ? put : post;

    method(url, {
      onSuccess: () => {
        onClose();
        Swal.fire({ 
            title: "¡Listo!", 
            text: `${data.type === 'product' ? 'Producto' : 'Servicio'} ${isEdit ? 'actualizado' : 'registrado'} correctamente.`, 
            icon: "success", 
            timer: 2000,
            confirmButtonColor: '#000'
        });
      },
    });
  };

  const isProduct = data.type === 'product';

  return (
    <div className="bg-white flex flex-col h-full animate-in fade-in duration-500">
      <form onSubmit={submit} className="flex flex-col h-full">
        {/* HEADER HERO */}
        <div className={`p-8 border-b border-gray-100 rounded-t-[2rem] flex items-center justify-between gap-6 shrink-0 relative overflow-hidden ${isProduct ? 'bg-gray-50/50' : 'bg-brand-secondary/5'}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
            <div className="flex items-center gap-4 relative z-10">
                <div className={`p-3.5 rounded-2xl shadow-xl shadow-brand-primary/20 transform rotate-3 ${isProduct ? 'bg-brand-primary text-white' : 'bg-brand-secondary text-brand-primary'}`}>
                    {isProduct ? <Package className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none mb-1">
                        {isEdit ? 'Editar Registro' : `Nuevo ${isProduct ? 'Producto' : 'Servicio'}`}
                    </h2>
                    <p className="text-[9px] font-black text-brand-gray uppercase tracking-[0.2em]">Gestión de Catálogo & Tarifas</p>
                </div>
            </div>
            {isEdit && (
                <div className={`px-3 py-1 rounded-lg border flex items-center gap-2 ${data.is_active ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-widest">{data.is_active ? 'Activo' : 'Baja'}</span>
                </div>
            )}
        </div>

        <div className="p-10 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
          
          {/* BLOQUE 0: TIPO Y CATEGORÍA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
                <label className="enterprise-label !text-[8px] ml-1 opacity-60">Naturaleza del Item</label>
                <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                    <button 
                        type="button"
                        onClick={() => setData('type', 'product')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isProduct ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-400'}`}
                    >
                        <Package className="w-3 h-3" /> Producto
                    </button>
                    <button 
                        type="button"
                        onClick={() => setData('type', 'service')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!isProduct ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-400'}`}
                    >
                        <Monitor className="w-3 h-3" /> Servicio
                    </button>
                </div>
            </div>

            <div className="space-y-1">
                <label className="enterprise-label !text-[8px] ml-1 opacity-60">Categorización</label>
                <div className="relative">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gray opacity-40" />
                    <select
                        value={data.category_id}
                        onChange={e => setData("category_id", e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-gray-100 bg-gray-50 text-[10px] font-black uppercase tracking-widest focus:bg-white focus:ring-brand-primary transition-all shadow-inner cursor-pointer"
                    >
                        <option value="">Sin Categoría</option>
                        {categories.map(cat => (
                            <React.Fragment key={cat.id}>
                                <option value={cat.id}>{cat.name}</option>
                                {cat.children?.map(sub => (
                                    <option key={sub.id} value={sub.id}>&nbsp;&nbsp;↳ {sub.name}</option>
                                ))}
                            </React.Fragment>
                        ))}
                    </select>
                </div>
            </div>
          </div>

          {/* BLOQUE 1: IDENTIFICACIÓN */}
          <div className="space-y-6">
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" /> Detalles Principales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-12 space-y-1">
                    <label className="enterprise-label !text-[8px] ml-1 opacity-60">Nombre del {isProduct ? 'Producto' : 'Servicio'}</label>
                    <TextInput
                        value={data.name}
                        onChange={e => setData("name", e.target.value)}
                        required
                        className="w-full !rounded-xl !py-3 font-black uppercase text-sm shadow-inner"
                        placeholder={isProduct ? "EJ: BANDA ELÁSTICA NIVEL 3" : "EJ: SESIÓN KINESIOLOGÍA"}
                    />
                    <InputError message={errors.name} />
                </div>
                
                <div className="md:col-span-4 space-y-1">
                    <label className="enterprise-label !text-[8px] ml-1 opacity-60">Código SKU</label>
                    <div className="relative">
                        <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gray opacity-40" />
                        <input
                            type="text"
                            value={data.sku}
                            onChange={e => setData("sku", e.target.value.toUpperCase())}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-gray-100 bg-gray-50 font-mono font-bold text-xs uppercase focus:bg-white focus:ring-brand-primary shadow-inner"
                            placeholder="REF-000"
                        />
                    </div>
                </div>

                {!isProduct && (
                   <div className="md:col-span-4 space-y-1">
                        <label className="enterprise-label !text-[8px] ml-1 opacity-60">Código Prestación (Fonasa/Isapre)</label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gray opacity-40" />
                            <input
                                type="text"
                                value={data.billing_code}
                                onChange={e => setData("billing_code", e.target.value.toUpperCase())}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-gray-100 bg-gray-50 font-mono font-bold text-xs uppercase focus:bg-white focus:ring-brand-primary shadow-inner"
                                placeholder="06-01-001"
                            />
                        </div>
                    </div>
                )}

                {!isProduct && (
                   <div className="md:col-span-4 space-y-1">
                        <label className="enterprise-label !text-[8px] ml-1 opacity-60">Especialidad</label>
                        <TextInput
                            value={data.specialty}
                            onChange={e => setData("specialty", e.target.value)}
                            className="w-full !rounded-xl !py-3 font-bold uppercase text-xs shadow-inner"
                            placeholder="EJ: KINESIOLOGÍA"
                        />
                    </div>
                )}

                {isProduct && (
                    <div className="md:col-span-6 space-y-1">
                        <label className="enterprise-label !text-[8px] ml-1 opacity-60">Código de Barras</label>
                        <div className="relative">
                            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gray opacity-40" />
                            <input
                                type="text"
                                value={data.barcode}
                                onChange={e => setData("barcode", e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-gray-100 bg-gray-50 font-mono font-bold text-xs focus:bg-white focus:ring-brand-primary shadow-inner"
                                placeholder="780123456789"
                            />
                        </div>
                    </div>
                )}
            </div>
          </div>

          {/* BLOQUE 2: VALORES ECONÓMICOS */}
          <div className={`p-8 border rounded-[2.5rem] space-y-8 relative overflow-hidden ${isProduct ? 'bg-brand-primary/5 border-brand-primary/10' : 'bg-brand-secondary/5 border-brand-secondary/10'}`}>
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2 relative z-10">
                <DollarSign className="w-3.5 h-3.5" /> Parámetros de Venta
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-1">
                    <label className="enterprise-label !text-[8px] ml-1">Precio PVP (Venta)</label>
                    <InputPesoChileno
                        price={data.price}
                        onChange={e => {
                            const val = String(e.target.value).replace(/[^0-9]/g, "");
                            if (val.length <= 9) setData("price", e.target.value);
                        }}
                        required
                        className="!rounded-xl !py-3 font-black text-sm bg-white shadow-sm border-gray-100"
                    />
                </div>

                <div className="flex items-end pb-1">
                    <label className="flex items-center justify-between w-full p-4 bg-white/60 rounded-2xl border border-gray-100 cursor-pointer hover:bg-white transition-all shadow-inner">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-4 h-4 text-brand-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Ítem Exento de IVA (SII)</span>
                        </div>
                        <Checkbox checked={data.is_exempt} onChange={e => setData("is_exempt", e.target.checked)} />
                    </label>
                </div>
            </div>

            {!isProduct && (
              <div className="space-y-6 pt-4 border-t border-gray-100/50">
                <div className="flex items-center justify-between">
                    <label className="enterprise-label !text-[8px] !text-purple-600 ml-1 mb-0">Configuración de Pago Profesional</label>
                    <div className="bg-gray-200/50 p-1 rounded-xl flex gap-1">
                        <button 
                            type="button"
                            onClick={() => setData('commission_type', 'fixed_amount')}
                            className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${data.commission_type === 'fixed_amount' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400'}`}
                        >
                            Monto Fijo ($)
                        </button>
                        <button 
                            type="button"
                            onClick={() => setData('commission_type', 'percentage')}
                            className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${data.commission_type === 'percentage' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400'}`}
                        >
                            Porcentaje (%)
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.commission_type === 'fixed_amount' ? (
                        <>
                            <div className="space-y-1">
                                <label className="enterprise-label !text-[8px] !text-purple-400 ml-1">Pago Paciente Propio ($)</label>
                                <div className="relative">
                                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-300" />
                                    <InputPesoChileno
                                        price={data.default_doctor_commission_own_clp}
                                        onChange={e => {
                                            const valStr = String(e.target.value).replace(/[^0-9]/g, "");
                                            const priceLimit = String(data.price).replace(/[^0-9]/g, "").length;
                                            if (valStr.length <= priceLimit) setData("default_doctor_commission_own_clp", e.target.value);
                                        }}
                                        className={`!pl-10 !rounded-xl !py-3 font-black text-xs bg-white shadow-sm border-purple-50 text-purple-700 ${data.default_doctor_commission_own_clp > data.price ? 'border-red-300 ring-1 ring-red-300' : ''}`}
                                    />
                                </div>
                                {data.default_doctor_commission_own_clp > data.price && (
                                    <p className="text-[7px] font-black text-red-500 uppercase mt-1 ml-1 animate-pulse">Excede precio de venta</p>
                                )}
                                <InputError message={errors.default_doctor_commission_own_clp} />
                            </div>
                            <div className="space-y-1">
                                <label className="enterprise-label !text-[8px] !text-purple-400 ml-1">Pago Paciente Asignado ($)</label>
                                <div className="relative">
                                    <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-300" />
                                    <InputPesoChileno
                                        price={data.default_doctor_commission_assigned_clp}
                                        onChange={e => {
                                            const valStr = String(e.target.value).replace(/[^0-9]/g, "");
                                            const priceLimit = String(data.price).replace(/[^0-9]/g, "").length;
                                            if (valStr.length <= priceLimit) setData("default_doctor_commission_assigned_clp", e.target.value);
                                        }}
                                        className={`!pl-10 !rounded-xl !py-3 font-black text-xs bg-white shadow-sm border-purple-50 text-purple-700 ${data.default_doctor_commission_assigned_clp > data.price ? 'border-red-300 ring-1 ring-red-300' : ''}`}
                                    />
                                </div>
                                {data.default_doctor_commission_assigned_clp > data.price && (
                                    <p className="text-[7px] font-black text-red-500 uppercase mt-1 ml-1 animate-pulse">Excede precio de venta</p>
                                )}
                                <InputError message={errors.default_doctor_commission_assigned_clp} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-1">
                                <label className="enterprise-label !text-[8px] !text-purple-400 ml-1">Comisión Paciente Propio (%)</label>
                                <div className="relative">
                                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-300" />
                                    <TextInputNumber
                                        value={data.default_doctor_commission_own_percentage}
                                        onChange={e => {
                                            const valStr = String(e.target.value);
                                            const val = parseFloat(e.target.value);
                                            if ((valStr.length <= 3 && val <= 100) || e.target.value === "") setData("default_doctor_commission_own_percentage", e.target.value);
                                        }}
                                        className={`!pl-10 !pr-10 !rounded-xl !py-3 font-black text-xs bg-white shadow-sm border-purple-50 text-purple-700 ${data.default_doctor_commission_own_percentage > 100 ? 'border-red-300 ring-1 ring-red-300' : ''}`}
                                        min={0}
                                        max={100}
                                    />
                                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-purple-300" />
                                </div>
                                {data.default_doctor_commission_own_percentage > 100 && (
                                    <p className="text-[7px] font-black text-red-500 uppercase mt-1 ml-1 animate-pulse">Máximo 100%</p>
                                )}
                                <InputError message={errors.default_doctor_commission_own_percentage} />
                            </div>
                            <div className="space-y-1">
                                <label className="enterprise-label !text-[8px] !text-purple-400 ml-1">Comisión Paciente Asignado (%)</label>
                                <div className="relative">
                                    <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-300" />
                                    <TextInputNumber
                                        value={data.default_doctor_commission_assigned_percentage}
                                        onChange={e => {
                                            const valStr = String(e.target.value);
                                            const val = parseFloat(e.target.value);
                                            if ((valStr.length <= 3 && val <= 100) || e.target.value === "") setData("default_doctor_commission_assigned_percentage", e.target.value);
                                        }}
                                        className={`!pl-10 !pr-10 !rounded-xl !py-3 font-black text-xs bg-white shadow-sm border-purple-50 text-purple-700 ${data.default_doctor_commission_assigned_percentage > 100 ? 'border-red-300 ring-1 ring-red-300' : ''}`}
                                        min={0}
                                        max={100}
                                    />
                                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-purple-300" />
                                </div>
                                {data.default_doctor_commission_assigned_percentage > 100 && (
                                    <p className="text-[7px] font-black text-red-500 uppercase mt-1 ml-1 animate-pulse">Máximo 100%</p>
                                )}
                                <InputError message={errors.default_doctor_commission_assigned_percentage} />
                            </div>
                        </>
                    )}
                </div>
              </div>
            )}

            {isProduct && (
                <div className="space-y-1">
                    <label className="enterprise-label !text-[8px] ml-1 opacity-60">Costo Neto (Referencia)</label>
                    <InputPesoChileno
                        price={data.cost_price}
                        onChange={e => setData("cost_price", e.target.value)}
                        className="!rounded-xl !py-3 font-bold text-xs bg-gray-50/50 border-gray-100"
                    />
                    <p className="text-[8px] text-gray-400 font-medium ml-1 mt-1 leading-tight">
                        <span className="font-bold text-gray-500">Info:</span> Valor de compra al proveedor. Se usa para calcular márgenes de utilidad, no es visible para el paciente.
                    </p>
                </div>
            )}
          </div>

          {/* BLOQUE 3: ESPECÍFICOS (PRODUCTO vs SERVICIO) */}
          {isProduct ? (
            <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between ml-1">
                    <h3 className="enterprise-label !text-brand-primary flex items-center gap-2 !mb-0">
                        <Boxes className="w-4 h-4" /> Control de Existencias
                    </h3>
                    <label className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-white transition-all shadow-sm group">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${data.manage_stock ? 'text-brand-primary' : 'text-brand-gray'}`}>Gestionar Stock</span>
                        <Switch checked={data.manage_stock} onChange={e => setData("manage_stock", e.target.checked)} />
                    </label>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-500 ${data.manage_stock ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                    <div className="space-y-1">
                        <label className="enterprise-label !text-[8px] ml-1">Stock Actual</label>
                        <input
                            type="number"
                            value={data.stock}
                            onChange={e => setData("stock", e.target.value ? parseInt(e.target.value) : 0)}
                            className="w-full rounded-xl border-gray-100 py-3 px-4 font-black text-sm bg-gray-50 focus:bg-white focus:ring-brand-primary shadow-inner"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="enterprise-label !text-[8px] !text-orange-600 ml-1">Nivel Crítico (Alerta)</label>
                        <div className="relative">
                            <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-400" />
                            <input
                                type="number"
                                value={data.critical_stock}
                                onChange={e => setData("critical_stock", e.target.value ? parseInt(e.target.value) : 0)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-orange-100 bg-orange-50/20 font-black text-sm focus:bg-white focus:ring-orange-500 shadow-inner"
                            />
                        </div>
                    </div>
                </div>
            </div>
          ) : (
            <div className="space-y-10 animate-in slide-in-from-top-4 duration-500">
                
                {/* CONFIGURACIÓN CLÍNICA / AGENDA */}
                <div className="space-y-6">
                    <h3 className="enterprise-label !text-brand-primary flex items-center gap-2 ml-1">
                        <Clock className="w-4 h-4" /> Configuración de Agenda & Capacidad
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="enterprise-label !text-[8px] ml-1 opacity-60">Duración Sesión</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gray opacity-40" />
                                <input
                                    type="number" min="5" step="5"
                                    value={data.duration_minutes}
                                    onChange={e => setData("duration_minutes", parseInt(e.target.value))}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border-gray-100 bg-gray-50 font-bold text-xs focus:bg-white focus:ring-brand-primary shadow-inner"
                                    required
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-brand-gray uppercase">Min</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="enterprise-label !text-[8px] ml-1 opacity-60">Color en Agenda</label>
                            <div className="relative flex items-center gap-2">
                                <div className="p-1 bg-gray-50 rounded-xl border border-gray-100 flex-1 flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={data.agenda_color}
                                        onChange={e => setData("agenda_color", e.target.value)}
                                        className="w-8 h-8 rounded-lg border-none cursor-pointer p-0 overflow-hidden"
                                    />
                                    <span className="font-mono text-[10px] font-bold text-gray-500 uppercase">{data.agenda_color}</span>
                                </div>
                                <Palette className="w-4 h-4 text-brand-primary opacity-30 shrink-0" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODALIDADES DE ATENCIÓN */}
                <div className="space-y-6">
                    <h3 className="enterprise-label !text-brand-primary flex items-center gap-2 ml-1">
                        <MapPin className="w-4 h-4" /> Modalidades & Instrucciones
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(!activeBranch || activeBranch.allows_onsite) && (
                            <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${data.allows_onsite ? 'bg-brand-primary/5 border-brand-primary/20 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                                <div className="flex items-center gap-2">
                                    <MapPin className={`w-4 h-4 ${data.allows_onsite ? 'text-brand-primary' : 'text-gray-400'}`} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Presencial</span>
                                </div>
                                <input type="checkbox" checked={data.allows_onsite} onChange={e => setData("allows_onsite", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                            </label>
                        )}

                        {activeBranch?.allows_online && (
                            <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${data.allows_online ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                                <div className="flex items-center gap-2">
                                    <Globe className={`w-4 h-4 ${data.allows_online ? 'text-blue-600' : 'text-gray-400'}`} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Online</span>
                                </div>
                                <input type="checkbox" checked={data.allows_online} onChange={e => setData("allows_online", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            </label>
                        )}

                        {activeBranch?.allows_home && (
                            <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${data.allows_home ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                                <div className="flex items-center gap-2">
                                    <Home className={`w-4 h-4 ${data.allows_home ? 'text-amber-600' : 'text-gray-400'}`} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Domicilio</span>
                                </div>
                                <input type="checkbox" checked={data.allows_home} onChange={e => setData("allows_home", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                            </label>
                        )}
                    </div>

                    <div className="space-y-2 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                        <label className="enterprise-label !text-[8px] ml-1 opacity-60 flex items-center gap-2">
                            <Info className="w-3 h-3 text-brand-primary" /> Instrucciones para el Paciente
                        </label>
                        <textarea
                            value={data.patient_instructions}
                            onChange={e => setData("patient_instructions", e.target.value)}
                            rows={3}
                            className="w-full rounded-2xl border-gray-100 bg-white p-4 text-[11px] font-medium text-gray-700 focus:ring-brand-primary shadow-sm"
                            placeholder="Ej: Venir con ropa cómoda/deportiva, traer exámenes previos..."
                        ></textarea>
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">Este texto se incluirá en los recordatorios automáticos (WhatsApp/Email).</p>
                    </div>
                </div>

                {/* REQUERIMIENTOS CLÍNICOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col p-5 bg-white border border-gray-100 rounded-3xl cursor-pointer hover:border-brand-primary/30 transition-all shadow-sm group">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-brand-primary/10 rounded-xl">
                                    <Activity className="w-4 h-4 text-brand-primary" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tight text-gray-900">Requiere Diagnóstico</span>
                            </div>
                            <input type="checkbox" checked={data.requires_diagnosis} onChange={e => setData("requires_diagnosis", e.target.checked)} className="w-5 h-5 rounded border-gray-200 text-brand-primary focus:ring-brand-primary" />
                        </div>
                        <p className="text-[9px] text-gray-500 leading-relaxed font-medium">
                            <span className="font-bold text-gray-700 uppercase tracking-tighter">Legal:</span> Obliga al registro de código CIE-10. Necesario para reembolsos.
                        </p>
                    </label>

                    <label className="flex flex-col p-5 bg-white border border-gray-100 rounded-3xl cursor-pointer hover:border-brand-primary/30 transition-all shadow-sm group">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-brand-primary/10 rounded-xl">
                                    <FileText className="w-4 h-4 text-brand-primary" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tight text-gray-900">Requiere Derivación</span>
                            </div>
                            <input type="checkbox" checked={data.requires_referral} onChange={e => setData("requires_referral", e.target.checked)} className="w-5 h-5 rounded border-gray-200 text-brand-primary focus:ring-brand-primary" />
                        </div>
                        <p className="text-[9px] text-gray-500 leading-relaxed font-medium">
                            <span className="font-bold text-gray-700 uppercase tracking-tighter">Operativo:</span> Alerta a Recepción sobre Orden Médica obligatoria.
                        </p>
                    </label>
                </div>
            </div>
          )}
        </div>

        {/* FOOTER FIJO PREMIUM */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4 shrink-0 rounded-b-[2rem]">
            <SecondaryButton onClick={() => { reset(); onClose(); }} className="!px-10 !py-4">Descartar</SecondaryButton>
            <PrimaryButton disabled={processing} type="submit" className="!px-14 !py-4 shadow-xl shadow-brand-primary/20">
                {processing ? 'Sincronizando...' : (isEdit ? `Actualizar ${isProduct ? 'Producto' : 'Servicio'}` : 'Guardar en Catálogo')}
            </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
