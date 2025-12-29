import { useState, useMemo } from "react";
import { useForm, router } from "@inertiajs/react";
import axios from "axios";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import ChilePhoneInput from "@/Components/ChilePhoneInput";
import RutInput from "@/Components/RutInput";
import Switch from "@/Components/Switch";
import moment from "moment";
import { 
  Building2, 
  UserPlus, 
  User, 
  ShieldCheck, 
  Heart, 
  Database, 
  Smartphone,
  Mail,
  Users,
  Baby,
  Activity,
  CheckCircle2,
  XCircle,
  ClipboardList
} from "lucide-react";
import { handleServerErrors } from "@/utils/FormHelpers";
import Swal from "sweetalert2";
import usePatientStore from "@/Stores/usePatientStore";

export default function ModalCreateEditPatient({
  patient,
  setOpenModalPatient,
  communes,
  regions,
  provinces,
  address = [],
}) {
  const [isExistingInSystem, setIsExistingInSystem] = useState(false);
  const addPatient = usePatientStore((state) => state.addPatient);

  const { data, setData, errors, setError, clearErrors, reset, processing } =
    useForm({
      id: patient?.id || "",
      branch_id: "",
      name: patient?.name || "",
      last_name: patient?.last_name || "",
      email: patient?.email || "",
      rut: patient?.rut || "",
      birth_date: patient?.birth_date
        ? moment.utc(patient.birth_date).format("YYYY-MM-DD")
        : moment().format("YYYY-MM-DD"),
      gender: patient?.gender || "",
      occupation: patient?.occupation || "",
      marital_status: patient?.marital_status || "",
      status: patient?.status || "active",
      status_reason: patient?.status_reason || "",
      phone: patient?.phone || "",
      opt_out_reminders: patient?.opt_out_reminders ?? true, 
      prefers_whatsapp: patient?.prefers_whatsapp ?? true,
      prefers_mail: patient?.prefers_mail ?? true,
      prefers_sms: patient?.prefers_sms ?? false,
      require_tutor: !!patient?.require_tutor,
      guardian_name: patient?.contact?.name || "",
      guardian_relationship: patient?.contact?.relationship || "",
      guardian_phone: patient?.contact?.phone || "",
      guardian_email: patient?.contact?.email || "",
      guardian_rut: patient?.contact?.rut || "",
    });

  const handleRutBlur = async (e) => {
    const cleanRut = e.target.value.replace(/\./g, "");
    if (data.id || cleanRut.length < 8) return;
    try {
      const response = await axios.post(route("patients.check-existing"), { rut: cleanRut });
      if (response.data.status === "exists") {
        const p = response.data.patient;
        setData(prev => ({
          ...prev, id: p.id, name: p.name, last_name: p.last_name, email: p.email, phone: p.phone,
          birth_date: moment.utc(p.birth_date).format("YYYY-MM-DD"), gender: p.gender,
          occupation: p.occupation, marital_status: p.marital_status
        }));
        setIsExistingInSystem(true);
        clearErrors();
      } else { setIsExistingInSystem(false); }
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();
    try {
      const url = data.id ? route("patients.update", data.id) : route("patients.store");
      const method = data.id ? "patch" : "post";
      const response = await axios[method](url, data);
      const newPatient = response.data.patient;

      setOpenModalPatient(false);
      reset();

      Swal.fire({
        title: "¡Registro Exitoso!",
        text: `Paciente ${newPatient?.name} guardado correctamente.`,
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "🚀 Agendar Atención",
        cancelButtonText: "Cerrar",
        confirmButtonColor: "#3292b3",
      }).then((result) => {
        if (result.isConfirmed) {
          router.visit(route("attendances.index", { patient_id: newPatient?.id }));
        } else {
          addPatient(newPatient);
        }
      });
    } catch (error) {
      if (!handleServerErrors(error, setError)) {
        Swal.fire("Error", "No se pudo procesar el registro.", "error");
      }
    }
  };

  const relationshipOptions = [
    { value: "madre", label: "Madre" }, { value: "padre", label: "Padre" }, { value: "hijo", label: "Hijo" },
    { value: "hija", label: "Hija" }, { value: "hermano", label: "Hermano" }, { value: "hermana", label: "Hermana" },
    { value: "tutor", label: "Tutor / Apoderado" }, { value: "conyuge", label: "Cónyuge" }, { value: "otro", label: "Otro" }
  ];

  return (
    <div className="bg-white flex flex-col h-full animate-in fade-in duration-500">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* HEADER HERO (Ahora integrado en el cuerpo porque el Modal padre no tendrá título) */}
        <div className="p-8 bg-gray-50/50 border-b border-gray-100 rounded-t-[2.5rem] flex items-center justify-between gap-6 shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="flex items-center gap-4 relative z-10">
                <div className="p-3.5 bg-brand-primary text-white rounded-2xl shadow-xl shadow-brand-primary/20 transform rotate-3">
                    <UserPlus className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none mb-1">
                        {data.id ? 'Optimizar Expediente' : 'Alta de Paciente'}
                    </h2>
                    <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">Ficha Maestra de Identidad</p>
                </div>
            </div>
            {isExistingInSystem && (
                <div className="px-4 py-2 bg-brand-secondary/10 border border-brand-secondary/20 rounded-xl flex items-center gap-3 animate-pulse relative z-10">
                    <ShieldCheck className="w-4 h-4 text-brand-primary" />
                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Paciente Identificado en Red</span>
                </div>
            )}
        </div>

        <div className="p-10 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
          
          {/* BLOQUE 1: IDENTIDAD */}
          <div className="space-y-6">
            <div className="flex items-center justify-between ml-1">
                <h3 className="enterprise-label !text-brand-primary flex items-center gap-2 !mb-0">
                    <Database className="w-4 h-4" /> Datos de Identidad
                </h3>
                <label className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-white transition-all shadow-sm group">
                    <Baby className={`w-4 h-4 transition-colors ${data.require_tutor ? 'text-brand-primary' : 'text-gray-300 group-hover:text-brand-primary'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${data.require_tutor ? 'text-brand-primary' : 'text-brand-gray'}`}>Menor / Requiere Tutor</span>
                    <Switch checked={data.require_tutor} onChange={e => setData("require_tutor", e.target.checked)} />
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                    <label className="enterprise-label ml-1 opacity-60">RUT / Identificador</label>
                    <RutInput value={data.rut} onChange={v => setData("rut", v)} onBlur={handleRutBlur} disabled={!!data.id} className="w-full !rounded-2xl !py-4 font-black" />
                    <InputError message={errors.rut} />
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label ml-1 opacity-60">Nombres</label>
                    <TextInput value={data.name} onChange={e => setData("name", e.target.value)} required className="w-full !rounded-2xl !py-4 font-bold shadow-inner" disabled={isExistingInSystem} />
                    <InputError message={errors.name} />
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label ml-1 opacity-60">Apellidos</label>
                    <TextInput value={data.last_name} onChange={e => setData("last_name", e.target.value)} required className="w-full !rounded-2xl !py-4 font-bold shadow-inner" disabled={isExistingInSystem} />
                    <InputError message={errors.last_name} />
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label ml-1 opacity-60">Fecha de Nacimiento</label>
                    <TextInput type="date" value={data.birth_date} onChange={e => setData("birth_date", e.target.value)} required className="w-full !rounded-2xl !py-4 font-bold font-mono shadow-inner" disabled={isExistingInSystem} />
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label ml-1 opacity-60">Género</label>
                    <select value={data.gender} onChange={e => setData("gender", e.target.value)} className="w-full rounded-2xl border-gray-100 py-4 px-5 font-bold text-sm focus:ring-brand-primary transition-all bg-gray-50/50 shadow-inner" required disabled={isExistingInSystem}>
                        <option value="">-- Seleccionar --</option>
                        <option value="female">Femenino</option>
                        <option value="male">Masculino</option>
                        <option value="other">Otro</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="enterprise-label ml-1 opacity-60">Estado Civil</label>
                    <select value={data.marital_status} onChange={e => setData("marital_status", e.target.value)} className="w-full rounded-2xl border-gray-100 py-4 px-5 font-bold text-sm focus:ring-brand-primary transition-all bg-gray-50/50 shadow-inner" disabled={isExistingInSystem || data.require_tutor}>
                        <option value="">-- Seleccionar --</option>
                        <option value="single">Soltero/a</option>
                        <option value="married">Casado/a</option>
                        <option value="divorced">Divorciado/a</option>
                        <option value="widowed">Viudo/a</option>
                    </select>
                </div>
            </div>
        </div>

        {/* BLOQUE 2: CONTACTO & OCUPACIÓN (Solo si no es menor) */}
        {!data.require_tutor && (
            <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-[2.5rem] space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <h3 className="enterprise-label !text-brand-primary flex items-center gap-2 relative z-10">
                    <Smartphone className="w-4 h-4" /> Contactabilidad & Profesión
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    <div className="space-y-1">
                        <label className="enterprise-label ml-1 opacity-60">Ocupación</label>
                        <TextInput value={data.occupation} onChange={e => setData("occupation", e.target.value)} className="w-full !rounded-2xl !py-4 font-bold bg-white" placeholder="Ej: Ingeniero" disabled={isExistingInSystem} />
                    </div>
                    <div className="space-y-1">
                        <label className="enterprise-label ml-1 opacity-60">Correo Electrónico</label>
                        <TextInput type="email" value={data.email} onChange={e => setData("email", e.target.value)} className="w-full !rounded-2xl !py-4 font-bold bg-white" placeholder="ejemplo@correo.com" disabled={isExistingInSystem} />
                        <InputError message={errors.email} />
                    </div>
                    <div className="space-y-1">
                        <label className="enterprise-label ml-1 opacity-60">Teléfono Directo</label>
                        <ChilePhoneInput value={data.phone} onChange={v => setData("phone", v)} className="w-full" disabled={isExistingInSystem} />
                        <InputError message={errors.phone} />
                    </div>
                </div>
            </div>
        )}

        {/* BLOQUE 3: TUTOR RESPONSABLE (Solo si se requiere) */}
        {data.require_tutor && (
            <div className="p-8 bg-brand-secondary/5 border border-brand-secondary/10 rounded-[2.5rem] space-y-8 animate-in slide-in-from-top-4 duration-500">
                <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
                    <Users className="w-4 h-4" /> Información del Tutor
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                        <label className="enterprise-label ml-1 opacity-60">RUT del Responsable</label>
                        <RutInput value={data.guardian_rut} onChange={v => setData("guardian_rut", v)} className="w-full !rounded-2xl !py-4 font-black bg-white" />
                    </div>
                    <div className="space-y-1">
                        <label className="enterprise-label ml-1 opacity-60">Nombre Completo</label>
                        <TextInput value={data.guardian_name} onChange={e => setData("guardian_name", e.target.value)} className="w-full !rounded-2xl !py-4 font-bold bg-white shadow-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="enterprise-label ml-1 opacity-60">WhatsApp de Cobro</label>
                        <ChilePhoneInput value={data.guardian_phone} onChange={v => setData("guardian_phone", v)} className="w-full" />
                    </div>
                    <div className="space-y-1">
                        <label className="enterprise-label ml-1 opacity-60">Email para Facturación</label>
                        <TextInput type="email" value={data.guardian_email} onChange={e => setData("guardian_email", e.target.value)} className="w-full !rounded-2xl !py-4 font-bold bg-white shadow-sm" />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <label className="enterprise-label ml-1 opacity-60">Parentesco con el Paciente</label>
                        <select value={data.guardian_relationship} onChange={e => setData("guardian_relationship", e.target.value)} className="w-full rounded-2xl border-gray-100 py-4 px-5 font-bold text-sm bg-white focus:ring-brand-primary">
                            <option value="">-- Seleccionar Vínculo --</option>
                            {relationshipOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        )}

        {/* BLOQUE 4: PREFERENCIAS DE CONECTIVIDAD */}
        <div className="space-y-6">
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> Centro de Notificaciones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl cursor-pointer hover:border-brand-primary/30 transition-all group shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl transition-colors ${data.opt_out_reminders ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-900 uppercase tracking-tight leading-none mb-1">Recordatorios</p>
                            <p className="text-[8px] font-bold text-gray-400 uppercase">Alertas de pago y sesiones</p>
                        </div>
                    </div>
                    <Switch checked={data.opt_out_reminders} onChange={e => setData("opt_out_reminders", e.target.checked)} />
                </label>

                {data.opt_out_reminders && (
                    <div className="p-6 bg-brand-primary/5 border border-brand-primary/10 rounded-3xl flex items-center justify-around animate-in zoom-in-95 duration-300">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" checked={data.prefers_whatsapp} onChange={e => setData("prefers_whatsapp", e.target.checked)} className="w-5 h-5 rounded-lg border-gray-200 text-brand-primary focus:ring-brand-primary" />
                            <span className="text-[10px] font-black text-brand-gray uppercase tracking-widest group-hover:text-brand-primary transition-colors">WhatsApp</span>
                        </label>
                        <div className="w-px h-6 bg-brand-primary/10"></div>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" checked={data.prefers_mail} onChange={e => setData("prefers_mail", e.target.checked)} className="w-5 h-5 rounded-lg border-gray-200 text-brand-primary focus:ring-brand-primary" />
                            <span className="text-[10px] font-black text-brand-gray uppercase tracking-widest group-hover:text-brand-primary transition-colors">Email</span>
                        </label>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* FOOTER FIJO PREMIUM */}
      <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4 shrink-0 rounded-b-[2.5rem]">
        <SecondaryButton onClick={() => { reset(); setOpenModalPatient(false); }} type="button" className="!px-10 !py-4">Descartar</SecondaryButton>
        <PrimaryButton disabled={processing} type="submit" className="!px-14 !py-4 shadow-xl shadow-brand-primary/20">
            {processing ? 'Sincronizando...' : (data.id || isExistingInSystem ? 'Actualizar Ficha' : 'Registrar Paciente')}
        </PrimaryButton>
      </div>
    </form>
    </div>
  );
}