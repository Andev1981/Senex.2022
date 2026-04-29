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
  FileText
} from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import TextInput from "@/components/TextInput";
import InputPesoChileno from "@/components/InputPesoChileno";
import Switch from "@/components/Switch";
import Checkbox from "@/components/Checkbox";
import Swal from "sweetalert2";
import InputError from "@/components/InputError";

export default function ProductModal({ isOpen, onClose, product = null, categories = [], initialType = "product" }) {
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
    default_doctor_commission_clp: product?.service_detail?.default_doctor_commission_clp || 0,
    requires_diagnosis: !!product?.service_detail?.requires_diagnosis,
    requires_referral: !!product?.service_detail?.requires_referral,
    specialty: product?.service_detail?.specialty || "",
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
        cost_price: product.product_detail?.cost_price || 0,
        price: product.price || 0,
        stock: product.product_detail?.stock || 0,
        critical_stock: product.product_detail?.critical_stock || 5,
        manage_stock: !!product.product_detail?.manage_stock,
        duration_minutes: product.service_detail?.duration_minutes || 45,
        default_doctor_commission_clp: product.service_detail?.default_doctor_commission_clp || 0,
        requires_diagnosis: !!product.service_detail?.requires_diagnosis,
        requires_referral: !!product.service_detail?.requires_referral,
        specialty: product.service_detail?.specialty || "",
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
                
                <div className="md:col-span-6 space-y-1">
                    <label className="enterprise-label !text-[8px] ml-1 opacity-60">Código SKU / Referencia</label>
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
                   <div className="md:col-span-6 space-y-1">
                        <label className="enterprise-label !text-[8px] ml-1 opacity-60">Especialidad (Texto)</label>
                        <TextInput
                            value={data.specialty}
                            onChange={e => setData("specialty", e.target.value)}
                            className="w-full !rounded-xl !py-3 font-bold uppercase text-xs shadow-inner"
                            placeholder="EJ: KINESIOLOGÍA, NUTRICIÓN..."
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
          <div className={`p-8 border rounded-[2.5rem] space-y-6 relative overflow-hidden ${isProduct ? 'bg-brand-primary/5 border-brand-primary/10' : 'bg-brand-secondary/5 border-brand-secondary/10'}`}>
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2 relative z-10">
                <DollarSign className="w-3.5 h-3.5" /> Parámetros de Venta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-1">
                    <label className="enterprise-label !text-[8px] ml-1">Precio PVP (Venta)</label>
                    <InputPesoChileno
                        price={data.price}
                        onChange={e => setData("price", e.target.value)}
                        required
                        className="!rounded-xl !py-3 font-black text-sm bg-white shadow-sm border-gray-100"
                    />
                </div>
                {!isProduct ? (
                     <div className="space-y-1">
                        <label className="enterprise-label !text-[8px] !text-purple-600 ml-1">Pago Profesional (Comisión)</label>
                        <div className="relative">
                            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                            <InputPesoChileno
                                price={data.default_doctor_commission_clp}
                                onChange={e => setData("default_doctor_commission_clp", e.target.value)}
                                required
                                className="!pl-10 !rounded-xl !py-3 font-black text-sm bg-white shadow-sm border-purple-100 text-purple-700"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <label className="enterprise-label !text-[8px] ml-1 opacity-40">Costo Neto (Referencia)</label>
                        <InputPesoChileno
                            price={data.cost_price}
                            onChange={e => setData("cost_price", e.target.value)}
                            className="!rounded-xl !py-3 font-bold text-xs bg-gray-50/50 border-gray-100"
                        />
                    </div>
                )}
                
                <label className="md:col-span-2 flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-gray-100 cursor-pointer hover:bg-white transition-all shadow-inner">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-brand-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Ítem Exento de IVA (SII)</span>
                    </div>
                    <Checkbox checked={data.is_exempt} onChange={e => setData("is_exempt", e.target.checked)} />
                </label>
            </div>
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
                            onChange={e => setData("stock", e.target.value)}
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
                                onChange={e => setData("critical_stock", e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-orange-100 bg-orange-50/20 font-black text-sm focus:bg-white focus:ring-orange-500 shadow-inner"
                            />
                        </div>
                    </div>
                </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between ml-1">
                    <h3 className="enterprise-label !text-brand-primary flex items-center gap-2 !mb-0">
                        <Clock className="w-4 h-4" /> Configuración de Sesión
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-6 space-y-1">
                        <label className="enterprise-label !text-[8px] ml-1 opacity-60">Duración Estimada</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gray opacity-40" />
                            <input
                                type="number"
                                min="5"
                                step="5"
                                value={data.duration_minutes}
                                onChange={e => setData("duration_minutes", parseInt(e.target.value))}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-gray-100 bg-gray-50 font-bold text-xs focus:bg-white focus:ring-brand-primary shadow-inner"
                                required
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-brand-gray uppercase">Min</span>
                        </div>
                    </div>

                    <div className="md:col-span-6 flex flex-col justify-center gap-3">
                        <label className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-brand-primary/30 transition-all shadow-sm">
                            <div className="flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-brand-primary" />
                                <span className="text-[9px] font-black uppercase tracking-tight text-gray-700">Requiere Diagnóstico</span>
                            </div>
                            <input type="checkbox" checked={data.requires_diagnosis} onChange={e => setData("requires_diagnosis", e.target.checked)} className="w-5 h-5 rounded border-gray-200 text-brand-primary focus:ring-brand-primary" />
                        </label>
                        <label className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-brand-primary/30 transition-all shadow-sm">
                            <div className="flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5 text-brand-primary" />
                                <span className="text-[9px] font-black uppercase tracking-tight text-gray-700">Requiere Derivación</span>
                            </div>
                            <input type="checkbox" checked={data.requires_referral} onChange={e => setData("requires_referral", e.target.checked)} className="w-5 h-5 rounded border-gray-200 text-brand-primary focus:ring-brand-primary" />
                        </label>
                    </div>
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
