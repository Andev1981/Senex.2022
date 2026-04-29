import { useState, useEffect, useMemo } from "react";
import { useForm } from "@inertiajs/react";
import axios from "axios";
import InputLabel from "@/components/InputLabel";
import InputError from "@/components/InputError";
import TextInput from "@/components/TextInput";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import ChilePhoneInput from "@/components/ChilePhoneInput";
import RutInput from "@/components/RutInput";
import Switch from "@/components/Switch";
import Checkbox from "@/components/Checkbox";
import EnterpriseSelect from "@/components/EnterpriseSelect";
import moment from "moment";
import { especialidadesChile } from "@/constants/especialidades";
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Stethoscope, 
  MapPin, 
  ShieldCheck, 
  Smartphone,
  Save,
  X,
  Database
} from "lucide-react";

export default function DoctorDetailModal({
  doctor,
  provinces = [],
  regions = [],
  communes = [],
  branches = [],
  setIsModalOpenDetail,
}) {
  const [isExistingInSystem, setIsExistingInSystem] = useState(false);

  const { data, setData, errors, post, put, reset, processing } = useForm({
    id: doctor?.id || null,
    name: doctor?.name || "",
    last_name: doctor?.last_name || "",
    rut: doctor?.rut || "",
    email: doctor?.email || "",
    phone: doctor?.phone || "",
    speciality: doctor?.speciality || "",
    birth_date: doctor?.birth_date
      ? moment.utc(doctor.birth_date).format("YYYY-MM-DD")
      : moment().format("YYYY-MM-DD"),
    gender: doctor?.gender || "",
    mobile_app_access: !!doctor?.mobile_app_access,
    status: doctor?.branch_status || "active",
    status_reason: doctor?.branch_status_reason || "",
    is_active: doctor ? !!doctor.is_active : true, // Estado Global
    commune_id: doctor?.commune_id ? String(doctor.commune_id) : (!doctor?.id ? "13114" : ""),
    province_id: doctor?.province_id ? String(doctor.province_id) : (!doctor?.id ? "2401" : ""),
    region_id: doctor?.region_id ? String(doctor.region_id) : (!doctor?.id ? "13" : ""),
    street: doctor?.street || "",
    number: doctor?.number || "",
    details: doctor?.details || "",
    branches: (doctor?.branches?.length > 0) ? doctor.branches.map(b => b.id) : (branches.length === 1 ? [branches[0].id] : []),
    license_number: doctor?.license_number || "",
  });

  const filteredProvinces = useMemo(() => {
    if (!data.region_id) return [];
    // Nota: p.region_id viene como string desde el controlador mapeado
    return provinces.filter(p => p.region_id == data.region_id);
  }, [provinces, data.region_id]);

  const filteredCommunes = useMemo(() => {
    if (!data.province_id) return [];
    // Nota: c.province_id viene como string desde el controlador mapeado
    return communes.filter(c => c.province_id == data.province_id);
  }, [communes, data.province_id]);

  const handleRutBlur = async (e) => {
    const cleanRut = e.target.value.replace(/\./g, "");
    if (data.id || cleanRut.length < 8) return;
    try {
      const response = await axios.post(route("doctors.check-existing"), { rut: cleanRut });
      if (response.data.status === "exists") {
        const d = response.data.doctor;
        setData({
          ...data,
          id: d.id, 
          name: d.name, 
          last_name: d.last_name, 
          email: d.email, 
          phone: d.phone,
          birth_date: d.birth_date || data.birth_date, 
          speciality: d.speciality || data.speciality,
          gender: d.gender || data.gender, 
          commune_id: d.commune_id ? String(d.commune_id) : data.commune_id, 
          province_id: d.province_id ? String(d.province_id) : data.province_id, 
          region_id: d.region_id ? String(d.region_id) : data.region_id,
          street: d.street || data.street, 
          number: d.number || data.number, 
          details: d.details || data.details, 
          license_number: d.license_number || data.license_number
        });
        setIsExistingInSystem(true);
      } else { setIsExistingInSystem(false); }
    } catch (e) { console.error(e); }
  };

  const handleBranchToggle = (branchId) => {
    const current = [...data.branches];
    const index = current.indexOf(branchId);
    if (index > -1) {
        current.splice(index, 1);
    } else {
        current.push(branchId);
    }
    setData("branches", current);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const opts = {
      onSuccess: () => { reset(); setIsModalOpenDetail(false); },
      preserveScroll: true
    };
    data.id ? put(route("doctors.update", data.id), opts) : post(route("doctors.store"), opts);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white min-h-full flex flex-col">
      {/* HEADER HERO FORM */}
      <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-primary text-white rounded-2xl shadow-lg shadow-brand-primary/20">
                <User className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none mb-1">
                    {data.id ? 'Editar Profesional' : 'Alta de Profesional'}
                </h2>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">Ficha Maestra de Especialista</p>
            </div>
        </div>
        {isExistingInSystem && (
            <div className="px-4 py-2 bg-brand-secondary/10 border border-brand-secondary/20 rounded-xl flex items-center gap-3 animate-pulse">
                <ShieldCheck className="w-4 h-4 text-brand-primary" />
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Profesional en Red: Se vinculará a sucursal actual</span>
            </div>
        )}
      </div>

      <div className="p-8 space-y-8 flex-1">
        
        {/* BLOQUE 1: IDENTIDAD */}
        <div className="space-y-6">
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
                <Database className="w-4 h-4" /> Datos de Identidad & Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                    <label className="enterprise-label ml-1">RUT Profesional</label>
                    <RutInput value={data.rut} onChange={v => setData("rut", v)} onBlur={handleRutBlur} disabled={!!data.id} className="w-full !rounded-xl !py-3 font-black" />
                    <InputError message={errors.rut} />
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label ml-1">Nombres</label>
                    <TextInput value={data.name} onChange={e => setData("name", e.target.value)} required className="w-full !rounded-xl !py-3 font-bold" disabled={isExistingInSystem} />
                    <InputError message={errors.name} />
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label ml-1">Apellidos</label>
                    <TextInput value={data.last_name} onChange={e => setData("last_name", e.target.value)} required className="w-full !rounded-xl !py-3 font-bold" disabled={isExistingInSystem} />
                    <InputError message={errors.last_name} />
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label ml-1">Correo Electrónico</label>
                    <TextInput type="email" value={data.email} onChange={e => setData("email", e.target.value)} required className="w-full !rounded-xl !py-3 font-bold" disabled={isExistingInSystem} />
                    <InputError message={errors.email} />
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label ml-1">Teléfono</label>
                    <ChilePhoneInput value={data.phone} onChange={v => setData("phone", v)} disabled={isExistingInSystem} className="w-full" />
                    <InputError message={errors.phone} />
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label ml-1">Nacimiento</label>
                    <TextInput type="date" value={data.birth_date} onChange={e => setData("birth_date", e.target.value)} required className="w-full !rounded-xl !py-3 font-bold font-mono" disabled={isExistingInSystem} />
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label ml-1">N° Registro Profesional</label>
                    <TextInput value={data.license_number} onChange={e => setData("license_number", e.target.value)} className="w-full !rounded-xl !py-3 font-bold" placeholder="Ej: 123456" />
                    <InputError message={errors.license_number} />
                </div>
            </div>
        </div>

        {/* BLOQUE 2: CONFIGURACIÓN */}
        <div className="p-6 bg-gray-50/50 border border-gray-100 rounded-3xl space-y-6">
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
                <Stethoscope className="w-4 h-4" /> Configuración Profesional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-1">
                    <EnterpriseSelect
                        label="Especialidad Principal"
                        value={data.speciality}
                        onChange={(val) => setData("speciality", val)}
                        options={especialidadesChile?.map(esp => ({ value: esp, label: esp }))}
                        disabled={isExistingInSystem}
                        placeholder="-- Seleccionar --"
                    />
                </div>
                <div className="space-y-1">
                    <EnterpriseSelect
                        label="Estado de Cuenta"
                        value={data.status}
                        onChange={(val) => setData("status", val)}
                        options={[
                            { value: 'active', label: 'Activo' },
                            { value: 'suspended', label: 'Suspendido' },
                            { value: 'cancelled', label: 'Inactivo' },
                        ]}
                    />
                    {data.status !== 'active' && (
                        <div className="mt-2 animate-in slide-in-from-top-2 duration-300">
                            <TextInput 
                                value={data.status_reason} 
                                onChange={e => setData("status_reason", e.target.value)} 
                                placeholder="Motivo del cambio..." 
                                required 
                                className="w-full !border-red-100 !bg-red-50/30 !py-2 !text-xs"
                            />
                            <InputError message={errors.status_reason} />
                        </div>
                    )}
                </div>
            </div>

            {/* ASIGNACIÓN DE SUCURSALES (Solo si hay más de una) */}
            {branches.length > 1 && (
                <div className="space-y-3">
                    <label className="enterprise-label ml-1">Asignación de Sucursales</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {branches.map(branch => (
                            <div key={branch.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-brand-primary/30 transition-all shadow-sm">
                                <Checkbox 
                                    checked={data.branches.includes(branch.id)} 
                                    onChange={() => handleBranchToggle(branch.id)}
                                />
                                <span className="text-[11px] font-black uppercase text-gray-700">{branch.name}</span>
                            </div>
                        ))}
                    </div>
                    <InputError message={errors.branches} />
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-brand-primary" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-900 leading-none mb-1">App Móvil</p>
                            <p className="text-[8px] font-bold text-gray-400 uppercase">Acceso Kine</p>
                        </div>
                    </div>
                    <Switch checked={data.mobile_app_access} onChange={e => setData("mobile_app_access", e.target.checked)} disabled={data.status !== 'active'} />
                </div>
                <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-brand-primary" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-900 leading-none mb-1">Estado Global</p>
                            <p className="text-[8px] font-bold text-gray-400 uppercase">{data.is_active ? 'Cuenta Activa' : 'Cuenta Inactiva'}</p>
                        </div>
                    </div>
                    <Switch checked={data.is_active} onChange={e => setData("is_active", e.target.checked)} />
                </div>
            </div>
        </div>

        {/* BLOQUE 3: LOCALIZACIÓN */}
        <div className="space-y-6 pb-8">
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Localización & Dirección
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                    <EnterpriseSelect
                        label="Región"
                        value={data.region_id}
                        onChange={(val) => { 
                            setData({ ...data, region_id: val, province_id: "", commune_id: "" });
                        }}
                        options={regions}
                        disabled={isExistingInSystem}
                        placeholder="-- Seleccionar --"
                    />
                </div>
                <div className="space-y-1">
                    <EnterpriseSelect
                        label="Provincia"
                        value={data.province_id}
                        onChange={(val) => { 
                            setData({ ...data, province_id: val, commune_id: "" });
                        }}
                        options={filteredProvinces}
                        disabled={!data.region_id || isExistingInSystem}
                        placeholder="-- Seleccionar --"
                    />
                </div>
                <div className="space-y-1">
                    <EnterpriseSelect
                        label="Comuna"
                        value={data.commune_id}
                        onChange={(val) => setData({ ...data, commune_id: val })}
                        options={filteredCommunes}
                        disabled={!data.province_id || isExistingInSystem}
                        placeholder="-- Seleccionar --"
                    />
                </div>
                <div className="md:col-span-2 space-y-1">
                    <label className="enterprise-label ml-1">Calle / Avenida</label>
                    <TextInput value={data.street} onChange={e => setData("street", e.target.value)} className="w-full !rounded-xl !py-3 font-bold" disabled={isExistingInSystem} />
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label ml-1">N°</label>
                    <TextInput value={data.number} onChange={e => setData("number", e.target.value)} className="w-full !rounded-xl !py-3 font-black font-mono" disabled={isExistingInSystem} />
                </div>
            </div>
        </div>
      </div>

      {/* FOOTER FIJO */}
      <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4 shrink-0">
        <SecondaryButton onClick={() => setIsModalOpenDetail(false)} type="button" className="!px-8 !py-3">Cancelar</SecondaryButton>
        <PrimaryButton disabled={processing} type="submit" className="!px-10 !py-3 shadow-xl shadow-brand-primary/20">
            {processing ? 'Sincronizando...' : (data.id || isExistingInSystem ? 'Actualizar Profesional' : 'Registrar Especialista')}
        </PrimaryButton>
      </div>
    </form>
  );
}