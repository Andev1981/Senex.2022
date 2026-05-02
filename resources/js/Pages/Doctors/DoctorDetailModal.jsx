import { useState, useEffect, useMemo } from "react";
import { useForm, router } from "@inertiajs/react";
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
  Database,
  Clock,
  Plus,
  Trash2,
  Coffee,
  Building,
  Layers
} from "lucide-react";
import Swal from "sweetalert2";

export default function DoctorDetailModal({
  doctor,
  provinces = [],
  regions = [],
  communes = [],
  branches = [],
  availabilities = [],
  rooms = [],
  setIsModalOpenDetail,
}) {
  const [activeTab, setActiveTab] = useState("general"); // general, availability
  const [isExistingInSystem, setIsExistingInSystem] = useState(false);

  // --- FORMULARIO DOCTOR ---
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

  // --- FORMULARIO DISPONIBILIDAD ---
  const avForm = useForm({
    doctor_id: doctor?.id || "",
    branch_id: branches.length === 1 ? branches[0].id : "",
    room_id: "",
    rrule: "",
    start_time: "09:00",
    end_time: "18:00",
    lunch_start_time: "13:00",
    lunch_end_time: "14:00",
    days: [],
  });

  const daysOfWeek = [
    { label: "Lun", value: "MO" },
    { label: "Mar", value: "TU" },
    { label: "Mié", value: "WE" },
    { label: "Jue", value: "TH" },
    { label: "Vie", value: "FR" },
    { label: "Sáb", value: "SA" },
    { label: "Dom", value: "SU" },
  ];

  const toggleDay = (day) => {
    const newDays = avForm.data.days.includes(day)
        ? avForm.data.days.filter(d => d !== day)
        : [...avForm.data.days, day];
    
    avForm.setData({
        ...avForm.data,
        days: newDays,
        rrule: `FREQ=WEEKLY;BYDAY=${newDays.join(",")}`
    });
  };

  const submitAv = (e) => {
    e.preventDefault();
    if (avForm.data.days.length === 0) return Swal.fire("Error", "Selecciona al menos un día", "error");
    
    avForm.post(route('availabilities.store'), {
        onSuccess: () => {
            avForm.reset('room_id', 'days', 'rrule');
            Swal.fire({ title: "Horario Agregado", icon: "success", toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        }
    });
  };

  const deleteAv = (id) => {
    Swal.fire({
        title: '¿Eliminar horario?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
    }).then((result) => {
        if (result.isConfirmed) {
            router.delete(route('availabilities.destroy', id), {
                preserveScroll: true,
                onSuccess: () => Swal.fire({ title: "Eliminado", icon: "success", toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 })
            });
        }
    });
  };

  const filteredProvinces = useMemo(() => {
    if (!data.region_id) return [];
    return provinces.filter(p => p.region_id == data.region_id);
  }, [provinces, data.region_id]);

  const filteredCommunes = useMemo(() => {
    if (!data.province_id) return [];
    return communes.filter(c => c.province_id == data.province_id);
  }, [communes, data.province_id]);

  const roomOptions = useMemo(() => {
    if (!avForm.data.branch_id) return [];
    return rooms.filter(r => r.branch_id == avForm.data.branch_id).map(r => ({ label: r.name, value: r.id }));
  }, [rooms, avForm.data.branch_id]);

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
    <div className="bg-white min-h-full flex flex-col">
      {/* HEADER HERO FORM */}
      <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex flex-col gap-6 shrink-0">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-primary text-white rounded-2xl shadow-lg shadow-brand-primary/20">
                    <User className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none mb-1">
                        {data.id ? `${data.name} ${data.last_name}` : 'Alta de Profesional'}
                    </h2>
                    <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">Ficha Maestra de Especialista</p>
                </div>
            </div>
            {isExistingInSystem && (
                <div className="px-4 py-2 bg-brand-secondary/10 border border-brand-secondary/20 rounded-xl flex items-center gap-3 animate-pulse">
                    <ShieldCheck className="w-4 h-4 text-brand-primary" />
                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Profesional en Red</span>
                </div>
            )}
        </div>

        {/* TABS DE NAVEGACIÓN */}
        <div className="flex items-center gap-6 border-b border-gray-100 -mb-8">
            <button 
                onClick={() => setActiveTab("general")} 
                className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'general' ? 'text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Datos Generales
                {activeTab === 'general' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary"></div>}
            </button>
            {data.id && (
                <button 
                    onClick={() => setActiveTab("availability")} 
                    className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'availability' ? 'text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Disponibilidad & Boxes
                    {activeTab === 'availability' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary"></div>}
                </button>
            )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'general' ? (
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
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
                <div className="space-y-6">
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

                {/* FOOTER FIJO GENERAL */}
                <div className="pt-8 border-t border-gray-100 flex justify-end gap-4 shrink-0">
                    <SecondaryButton onClick={() => setIsModalOpenDetail(false)} type="button" className="!px-8 !py-3">Cerrar</SecondaryButton>
                    <PrimaryButton disabled={processing} type="submit" className="!px-10 !py-3 shadow-xl shadow-brand-primary/20">
                        {processing ? 'Sincronizando...' : (data.id || isExistingInSystem ? 'Actualizar Profesional' : 'Registrar Especialista')}
                    </PrimaryButton>
                </div>
            </form>
        ) : (
            <div className="p-8 space-y-10">
                {/* FORMULARIO DISPONIBILIDAD */}
                <div className="bg-gray-50 border border-gray-100 rounded-[2.5rem] p-8">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                        <Plus className="w-5 h-5 text-brand-primary" /> Definir Nueva Jornada
                    </h3>
                    <form onSubmit={submitAv} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <EnterpriseSelect 
                                label="Sucursal de Atención" 
                                icon={Building} 
                                value={avForm.data.branch_id} 
                                onChange={v => avForm.setData(prev => ({ ...prev, branch_id: v, room_id: "" }))} 
                                options={branches.map(b => ({ label: b.name, value: b.id }))} 
                                required 
                            />
                            <EnterpriseSelect 
                                label="Box / Sala Asignada" 
                                icon={Layers} 
                                value={avForm.data.room_id} 
                                onChange={v => avForm.setData("room_id", v)} 
                                options={roomOptions} 
                                placeholder="Cualquier Box Disponible" 
                                disabled={!avForm.data.branch_id} 
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Días de Atención Semanal</label>
                            <div className="grid grid-cols-7 gap-2">
                                {daysOfWeek.map(day => (
                                    <button 
                                        key={day.value} 
                                        type="button" 
                                        onClick={() => toggleDay(day.value)} 
                                        className={`py-4 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${avForm.data.days.includes(day.value) ? "bg-brand-primary border-brand-primary text-white" : "bg-white border-gray-100 text-gray-400"}`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1"><label className="enterprise-label">Hora Inicio</label><TextInput type="time" value={avForm.data.start_time} onChange={e => avForm.setData("start_time", e.target.value)} required /></div>
                            <div className="space-y-1"><label className="enterprise-label">Hora Término</label><TextInput type="time" value={avForm.data.end_time} onChange={e => avForm.setData("end_time", e.target.value)} required /></div>
                        </div>

                        <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100/50 space-y-4">
                            <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2"><Coffee className="w-3 h-3" /> Bloque de Colación</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1"><label className="text-[8px] font-black text-gray-400 uppercase">Inicio</label><TextInput type="time" value={avForm.data.lunch_start_time} onChange={e => avForm.setData("lunch_start_time", e.target.value)} className="!bg-white" /></div>
                                <div className="space-y-1"><label className="text-[8px] font-black text-gray-400 uppercase">Fin</label><TextInput type="time" value={avForm.data.lunch_end_time} onChange={e => avForm.setData("lunch_end_time", e.target.value)} className="!bg-white" /></div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <PrimaryButton disabled={avForm.processing} className="!px-12 !py-4 shadow-xl shadow-brand-primary/20">
                                {avForm.processing ? '...' : 'Agregar Horario'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>

                {/* LISTADO DE DISPONIBILIDADES */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                        <Clock className="w-5 h-5 text-brand-primary" /> Horarios de Atención Vigentes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availabilities.length === 0 ? (
                            <div className="col-span-full py-10 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                <p className="text-[10px] font-black text-gray-400 uppercase">Sin horarios configurados</p>
                            </div>
                        ) : availabilities.map(av => (
                            <div key={av.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-brand-primary/5 text-brand-primary rounded-xl"><Building className="w-4 h-4" /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-900 uppercase">{av.branch?.name}</p>
                                            <p className="text-[8px] font-black text-brand-primary uppercase tracking-widest">{av.room?.name || "Box por asignar"}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteAv(av.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-black text-gray-700 mb-4 bg-gray-50 p-3 rounded-xl">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    {av.start_time.substring(0, 5)} — {av.end_time.substring(0, 5)}
                                    {av.lunch_start_time && (
                                        <span className="text-[8px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-lg flex items-center gap-1 ml-auto">
                                            <Coffee className="w-2.5 h-2.5" /> {av.lunch_start_time.substring(0, 5)} - {av.lunch_end_time.substring(0, 5)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {av.rrule.split('BYDAY=')[1]?.split(',').map(day => (
                                        <span key={day} className="px-2 py-0.5 bg-gray-100 text-[8px] font-black text-gray-500 rounded-lg uppercase">{day}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
  }