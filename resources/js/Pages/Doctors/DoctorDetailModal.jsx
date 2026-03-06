import { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import InputLabel from "@/components/InputLabel";
import InputError from "@/components/InputError";
import TextInput from "@/components/TextInput";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import ChilePhoneInput from "@/components/ChilePhoneInput";
import RutInput from "@/components/RutInput";
import Switch from "@/components/Switch";
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
  provinces,
  regions,
  communes,
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
    commune_id: doctor?.commune_id || "",
    province_id: doctor?.province_id || "",
    region_id: doctor?.region_id || "",
    street: doctor?.street || "",
    number: doctor?.number || "",
    details: doctor?.details || "",
  });

  const handleRutBlur = async (e) => {
    const cleanRut = e.target.value.replace(/\./g, "");
    if (data.id || cleanRut.length < 8) return;
    try {
      const response = await axios.post(route("doctors.check-existing"), { rut: cleanRut });
      if (response.data.status === "exists") {
        const d = response.data.doctor;
        setData(prev => ({
          ...prev, id: d.id, name: d.name, last_name: d.last_name, email: d.email, phone: d.phone,
          birth_date: moment.utc(d.birth_date).format("YYYY-MM-DD"), speciality: d.speciality,
          gender: d.gender, mobile_app_access: !!d.mobile_app_access, status: d.status,
          commune_id: d.commune_id, province_id: d.province_id, region_id: d.region_id,
          street: d.street, number: d.number, details: d.details
        }));
        setIsExistingInSystem(true);
      } else { setIsExistingInSystem(false); }
    } catch (e) { console.error(e); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const opts = {
      onSuccess: () => { reset(); setIsModalOpenDetail(false); },
      preserveScroll: true
    };
    data.id ? put(route("doctors.update", data.id), opts) : post(route("doctors.store"), opts);
  };

  const filteredProvinces = provinces?.filter(p => p.region_id === parseInt(data.region_id));
  const filteredCommunes = communes?.filter(c => c.province_id === parseInt(data.province_id));

  return (
    <form onSubmit={handleSubmit} className="bg-white">
      {/* HEADER HERO FORM */}
      <div className="p-8 bg-gray-50/50 border-b border-gray-100 rounded-t-[2rem] flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <div className="p-3.5 bg-brand-primary text-white rounded-2xl shadow-lg shadow-brand-primary/20 transform rotate-3">
                <User className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none mb-1">
                    {data.id ? 'Optimizar Registro' : 'Alta de Profesional'}
                </h2>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">Ficha Maestra de Especialista</p>
            </div>
        </div>
        {isExistingInSystem && (
            <div className="px-4 py-2 bg-brand-secondary/10 border border-brand-secondary/20 rounded-xl flex items-center gap-3 animate-pulse">
                <ShieldCheck className="w-4 h-4 text-brand-primary" />
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Doctor Identificado en Red</span>
            </div>
        )}
      </div>

      <div className="p-10 space-y-10">
        
        {/* BLOQUE 1: IDENTIDAD */}
        <div className="space-y-6">
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
                <Database className="w-4 h-4" /> Datos de Identidad & Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                    <label className="enterprise-label ml-1">RUT Profesional</label>
                    <RutInput value={data.rut} onChange={v => setData("rut", v)} onBlur={handleRutBlur} disabled={!!data.id} className="w-full !rounded-2xl !py-4 font-black" />
                    <InputError message={errors.rut} />
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label ml-1">Nombres</label>
                    <TextInput value={data.name} onChange={e => setData("name", e.target.value)} required className="w-full !rounded-2xl !py-4 font-bold" disabled={isExistingInSystem} />
                    <InputError message={errors.name} />
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label ml-1">Apellidos</label>
                    <TextInput value={data.last_name} onChange={e => setData("last_name", e.target.value)} required className="w-full !rounded-2xl !py-4 font-bold" disabled={isExistingInSystem} />
                    <InputError message={errors.last_name} />
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label ml-1">Correo Electrónico</label>
                    <TextInput type="email" value={data.email} onChange={e => setData("email", e.target.value)} required className="w-full !rounded-2xl !py-4 font-bold" disabled={isExistingInSystem} />
                    <InputError message={errors.email} />
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label ml-1">Teléfono</label>
                    <ChilePhoneInput value={data.phone} onChange={v => setData("phone", v)} disabled={isExistingInSystem} className="w-full" />
                    <InputError message={errors.phone} />
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label ml-1">Nacimiento</label>
                    <TextInput type="date" value={data.birth_date} onChange={e => setData("birth_date", e.target.value)} required className="w-full !rounded-2xl !py-4 font-bold font-mono" disabled={isExistingInSystem} />
                </div>
            </div>
        </div>

        {/* BLOQUE 2: ESPECIALIDAD & ACCESO */}
        <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-[2.5rem] space-y-8">
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
                <Stethoscope className="w-4 h-4" /> Configuración Profesional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
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
                            { value: 'cancelled', label: 'Cancelado' },
                        ]}
                    />
                </div>
                <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-brand-primary" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-900 leading-none mb-1">App Móvil</p>
                            <p className="text-[8px] font-bold text-gray-400 uppercase">Habilitar acceso Kine</p>
                        </div>
                    </div>
                    <Switch checked={data.mobile_app_access} onChange={e => setData("mobile_app_access", e.target.checked)} disabled={data.status !== 'active'} />
                </div>
            </div>
        </div>

        {/* BLOQUE 3: LOCALIZACIÓN */}
        <div className="space-y-6">
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Localización & Dirección
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                    <EnterpriseSelect
                        label="Región"
                        value={data.region_id}
                        onChange={(val) => { setData("region_id", val); setData("province_id", ""); setData("commune_id", ""); }}
                        options={regions?.map(r => ({ value: r.id, label: r.name }))}
                        disabled={isExistingInSystem}
                        placeholder="-- Seleccionar --"
                    />
                </div>
                <div className="space-y-1">
                    <EnterpriseSelect
                        label="Provincia"
                        value={data.province_id}
                        onChange={(val) => { setData("province_id", val); setData("commune_id", ""); }}
                        options={filteredProvinces?.map(p => ({ value: p.id, label: p.name }))}
                        disabled={!data.region_id || isExistingInSystem}
                        placeholder="-- Seleccionar --"
                    />
                </div>
                <div className="space-y-1">
                    <EnterpriseSelect
                        label="Comuna"
                        value={data.commune_id}
                        onChange={(val) => setData("commune_id", val)}
                        options={filteredCommunes?.map(c => ({ value: c.id, label: c.name }))}
                        disabled={!data.province_id || isExistingInSystem}
                        placeholder="-- Seleccionar --"
                    />
                </div>
                <div className="md:col-span-2 space-y-1">
                    <label className="enterprise-label ml-1">Calle / Avenida</label>
                    <TextInput value={data.street} onChange={e => setData("street", e.target.value)} className="w-full !rounded-2xl !py-4 font-bold" disabled={isExistingInSystem} />
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label ml-1">N°</label>
                    <TextInput value={data.number} onChange={e => setData("number", e.target.value)} className="w-full !rounded-2xl !py-4 font-black font-mono" disabled={isExistingInSystem} />
                </div>
            </div>
        </div>
      </div>

      {/* FOOTER FIJO */}
      <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4 shrink-0 rounded-b-[2rem]">
        <SecondaryButton onClick={() => setIsModalOpenDetail(false)} type="button" className="!px-10 !py-4">Cancelar</SecondaryButton>
        <PrimaryButton disabled={processing} type="submit" className="!px-14 !py-4 shadow-xl shadow-brand-primary/20">
            {processing ? 'Sincronizando...' : (data.id || isExistingInSystem ? 'Actualizar Profesional' : 'Registrar Especialista')}
        </PrimaryButton>
      </div>
    </form>
  );
}