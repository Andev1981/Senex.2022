import { useState, useMemo, useEffect } from "react";
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
  ClipboardList,
  MapPin,
  Navigation,
} from "lucide-react";
import { handleServerErrors } from "@/utils/FormHelpers";
import Swal from "sweetalert2";
import usePatientStore from "@/Stores/usePatientStore";

export default function ModalCreateEditPatient({
  patient,
  setOpenModalPatient,
  communes = [],
  regions = [],
  provinces = [],
}) {
  const [isExistingInSystem, setIsExistingInSystem] = useState(false);
  const addPatient = usePatientStore((state) => state.addPatient);

  const {
    data,
    setData,
    errors,
    setError,
    clearErrors,
    reset,
    post,
    patch,
    processing,
  } = useForm({
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
    // Campos de dirección
    is_home_care: !!patient?.address,
    street: patient?.address?.street || "",
    number: patient?.address?.number || "",
    details: patient?.address?.details || "",
    region_id: patient?.address?.commune?.province?.region_id || "",
    province_id: patient?.address?.commune?.province_id || "",
    commune_id: patient?.address?.commune_id || "",
  });

  // Filtrado dinámico de provincias y comunas
  const filteredProvinces = useMemo(
    () => provinces.filter((p) => p.region_id == data.region_id),
    [data.region_id, provinces]
  );

  const filteredCommunes = useMemo(
    () => communes.filter((c) => c.province_id == data.province_id),
    [data.province_id, communes]
  );

  // Sincronizar datos cuando cambia el paciente seleccionado (Edición)
  useEffect(() => {
    if (patient) {
      // Normalizar contacto (puede venir como primary_contact o contact)
      const contact = patient.primary_contact || patient.contact;

      // Normalizar dirección (puede venir anidada en address o aplanada)
      const hasAddress = !!patient.address || !!patient.address_id;
      const street = patient.address?.street || patient.street || "";
      const number = patient.address?.number || patient.number || "";
      const details = patient.address?.details || patient.details || "";
      const regionId =
        patient.address?.commune?.province?.region_id ||
        patient.region_id ||
        "";
      const provinceId =
        patient.address?.commune?.province_id || patient.province_id || "";
      const communeId = patient.address?.commune_id || patient.commune_id || "";

      setData({
        id: patient.id,
        branch_id: "",
        name: patient.name || "",
        last_name: patient.last_name || "",
        email: patient.email || "",
        rut: patient.rut || "",
        birth_date: patient.birth_date
          ? moment.utc(patient.birth_date).format("YYYY-MM-DD")
          : moment().format("YYYY-MM-DD"),
        gender: patient.gender || "",
        occupation: patient.occupation || "",
        marital_status: patient.marital_status || "",
        status: patient.status || "active",
        status_reason: patient.status_reason || "",
        phone: patient.phone || "",
        opt_out_reminders: patient.opt_out_reminders ?? true,
        prefers_whatsapp: patient.prefers_whatsapp ?? true,
        prefers_mail: patient.prefers_mail ?? true,
        prefers_sms: patient.prefers_sms ?? false,
        require_tutor: !!patient.require_tutor,

        // Datos del tutor
        guardian_name: contact?.name || "",
        guardian_relationship: contact?.relationship || "",
        guardian_phone: contact?.phone || "",
        guardian_email: contact?.email || "",
        guardian_rut: contact?.rut || "",

        // Campos de dirección
        is_home_care: hasAddress,
        street: street,
        number: number,
        details: details,
        region_id: regionId,
        province_id: provinceId,
        commune_id: communeId,
      });
      setIsExistingInSystem(true);
    } else {
      // Limpiar formulario para nuevo registro
      reset();
      setIsExistingInSystem(false);
    }
  }, [patient]);

  const handleRutBlur = async (e) => {
    const cleanRut = e.target.value.replace(/\./g, "");
    if (data.id || cleanRut.length < 8) return;
    try {
      const response = await axios.post(route("patients.check-existing"), {
        rut: cleanRut,
      });
      if (response.data.status === "exists") {
        const p = response.data.patient;
        setData((prev) => ({
          ...prev,
          id: p.id,
          name: p.name,
          last_name: p.last_name,
          email: p.email,
          phone: p.phone,
          birth_date: moment.utc(p.birth_date).format("YYYY-MM-DD"),
          gender: p.gender,
          occupation: p.occupation,
          marital_status: p.marital_status,
        }));
        setIsExistingInSystem(true);
        clearErrors();
      } else {
        setIsExistingInSystem(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = data.id
      ? route("patients.update", data.id)
      : route("patients.store");
    const method = data.id ? patch : post;

    method(url, {
      onSuccess: (page) => {
        const newPatient = page.props.patient || patient;
        setOpenModalPatient(false);
        reset();

        Swal.fire({
          title: "¡Registro Exitoso!",
          text: `Paciente gestionado correctamente.`,
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "🚀 Agendar Atención",
          cancelButtonText: "Cerrar",
          confirmButtonColor: "#3292b3",
        }).then((result) => {
          if (result.isConfirmed && newPatient?.id) {
            router.visit(
              route("attendances.index", { patient_id: newPatient.id })
            );
          }
        });
      },
      onError: (err) => {
        console.error(err);
        Swal.fire("Atención", "Revise los campos marcados en rojo.", "warning");
      },
    });
  };

  const relationshipOptions = [
    { value: "madre", label: "Madre" },
    { value: "padre", label: "Padre" },
    { value: "hijo", label: "Hijo" },
    { value: "hija", label: "Hija" },
    { value: "hermano", label: "Hermano" },
    { value: "hermana", label: "Hermana" },
    { value: "tutor", label: "Tutor / Apoderado" },
    { value: "conyuge", label: "Cónyuge" },
    { value: "otro", label: "Otro" },
  ];

  return (
    <div className="flex flex-col h-full duration-500 bg-white animate-in fade-in">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* HEADER HERO */}
        <div className="p-8 bg-gray-50/50 border-b border-gray-100 rounded-t-[2.5rem] flex items-start justify-between gap-6 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-brand-primary/5 blur-2xl"></div>

          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-brand-primary text-white rounded-2xl shadow-xl shadow-brand-primary/20 transform rotate-3">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="mb-1 text-2xl font-black leading-none tracking-tight text-gray-900 uppercase">
                  {data.id ? "Optimizar Expediente" : "Alta de Paciente"}
                </h2>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
                  Ficha Maestra de Identidad
                </p>
              </div>
            </div>

            {isExistingInSystem && (
              <div className="flex items-center gap-4 px-5 py-3 text-orange-700 duration-500 border border-orange-200 shadow-sm bg-orange-50 rounded-2xl animate-in slide-in-from-left-4">
                <ShieldCheck className="w-5 h-5 text-orange-600" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    Perfil Maestro Global Detectado
                  </span>
                  <span className="text-[9px] font-bold opacity-80 uppercase tracking-wide">
                    Las modificaciones afectarán a todas las sucursales
                    vinculadas.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 p-10 space-y-10 overflow-y-auto custom-scrollbar">
          {/* BLOQUE 1: IDENTIDAD */}
          <div className="space-y-6">
            <div className="flex items-center justify-between ml-1">
              <h3 className="enterprise-label !text-brand-primary flex items-center gap-2 !mb-0">
                <Database className="w-4 h-4" /> Datos de Identidad
              </h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 px-4 py-2 transition-all border border-gray-100 shadow-sm cursor-pointer bg-gray-50 rounded-xl hover:bg-white group">
                  <Navigation
                    className={`w-4 h-4 transition-colors ${
                      data.is_home_care ? "text-blue-600" : "text-gray-300"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest ${
                      data.is_home_care ? "text-blue-600" : "text-brand-gray"
                    }`}
                  >
                    A Domicilio
                  </span>
                  <Switch
                    checked={data.is_home_care}
                    onChange={(e) => setData("is_home_care", e.target.checked)}
                  />
                </label>
                <label className="flex items-center gap-3 px-4 py-2 transition-all border border-gray-100 shadow-sm cursor-pointer bg-gray-50 rounded-xl hover:bg-white group">
                  <Baby
                    className={`w-4 h-4 transition-colors ${
                      data.require_tutor
                        ? "text-brand-primary"
                        : "text-gray-300 group-hover:text-brand-primary"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest ${
                      data.require_tutor
                        ? "text-brand-primary"
                        : "text-brand-gray"
                    }`}
                  >
                    Requiere Tutor
                  </span>
                  <Switch
                    checked={data.require_tutor}
                    onChange={(e) => setData("require_tutor", e.target.checked)}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="space-y-1">
                <label className="ml-1 enterprise-label opacity-60">
                  RUT / Identificador
                </label>
                <RutInput
                  value={data.rut}
                  onChange={(v) => setData("rut", v)}
                  onBlur={handleRutBlur}
                  disabled={!!data.id}
                  className="w-full !rounded-2xl !py-1 font-black"
                />
                <InputError message={errors.rut} />
              </div>
              <div className="space-y-1">
                <label className="ml-1 enterprise-label opacity-60">
                  Nombres
                </label>
                <TextInput
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  required
                  className="w-full !rounded-2xl !py-4 font-bold shadow-inner"
                />
                <InputError message={errors.name} />
              </div>
              <div className="space-y-1">
                <label className="ml-1 enterprise-label opacity-60">
                  Apellidos
                </label>
                <TextInput
                  value={data.last_name}
                  onChange={(e) => setData("last_name", e.target.value)}
                  required
                  className="w-full !rounded-2xl !py-4 font-bold shadow-inner"
                />
                <InputError message={errors.last_name} />
              </div>
              <div className="space-y-1">
                <label className="ml-1 enterprise-label opacity-60">
                  Fecha de Nacimiento
                </label>
                <TextInput
                  type="date"
                  value={data.birth_date}
                  onChange={(e) => setData("birth_date", e.target.value)}
                  required
                  className="w-full !rounded-2xl !py-4 font-bold font-mono shadow-inner"
                />
                <InputError message={errors.birth_date} />
              </div>
              <div className="space-y-1">
                <label className="ml-1 enterprise-label opacity-60">
                  Género
                </label>
                <select
                  value={data.gender}
                  onChange={(e) => setData("gender", e.target.value)}
                  className="w-full px-5 py-4 text-sm font-bold transition-all border-gray-100 shadow-inner rounded-2xl focus:ring-brand-primary bg-gray-50/50"
                  required
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="female">Femenino</option>
                  <option value="male">Masculino</option>
                  <option value="other">Otro</option>
                </select>
                <InputError message={errors.gender} />
              </div>
              <div className="space-y-1">
                <label className="ml-1 enterprise-label opacity-60">
                  Estado Civil
                </label>
                <select
                  value={data.marital_status}
                  onChange={(e) => setData("marital_status", e.target.value)}
                  className="w-full px-5 py-4 text-sm font-bold transition-all border-gray-100 shadow-inner rounded-2xl focus:ring-brand-primary bg-gray-50/50"
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="single">Soltero/a</option>
                  <option value="married">Casado/a</option>
                  <option value="divorced">Divorciado/a</option>
                  <option value="widowed">Viudo/a</option>
                </select>
                <InputError message={errors.marital_status} />
              </div>
            </div>
          </div>

          {/* BLOQUE UBICACIÓN */}
          {data.is_home_care && (
            <div className="p-8 bg-blue-50/30 border border-blue-100 rounded-[2.5rem] space-y-8 animate-in slide-in-from-top-4 duration-500">
              <h3 className="enterprise-label !text-blue-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Localización para Atención
                Domiciliaria
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-1">
                  <label className="ml-1 enterprise-label opacity-60">
                    Región
                  </label>
                  <select
                    value={data.region_id}
                    onChange={(e) =>
                      setData((d) => ({
                        ...d,
                        region_id: e.target.value,
                        province_id: "",
                        commune_id: "",
                      }))
                    }
                    className="w-full px-5 py-4 text-sm font-bold bg-white border-gray-100 shadow-sm rounded-2xl focus:ring-blue-500"
                  >
                    <option value="">-- Seleccionar --</option>
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <InputError message={errors.region_id} />
                </div>
                <div className="space-y-1">
                  <label className="ml-1 enterprise-label opacity-60">
                    Provincia
                  </label>
                  <select
                    value={data.province_id}
                    onChange={(e) =>
                      setData((d) => ({
                        ...d,
                        province_id: e.target.value,
                        commune_id: "",
                      }))
                    }
                    className="w-full px-5 py-4 text-sm font-bold bg-white border-gray-100 shadow-sm rounded-2xl focus:ring-blue-500"
                    disabled={!data.region_id}
                  >
                    <option value="">-- Seleccionar --</option>
                    {filteredProvinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <InputError message={errors.province_id} />
                </div>
                <div className="space-y-1">
                  <label className="ml-1 enterprise-label opacity-60">
                    Comuna
                  </label>
                  <select
                    value={data.commune_id}
                    onChange={(e) => setData("commune_id", e.target.value)}
                    className="w-full px-5 py-4 text-sm font-bold bg-white border-gray-100 shadow-sm rounded-2xl focus:ring-blue-500"
                    disabled={!data.province_id}
                  >
                    <option value="">-- Seleccionar --</option>
                    {filteredCommunes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <InputError message={errors.commune_id} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="ml-1 enterprise-label opacity-60">
                    Calle / Avenida
                  </label>
                  <TextInput
                    value={data.street}
                    onChange={(e) => setData("street", e.target.value)}
                    className="w-full !rounded-2xl !py-4 font-bold bg-white shadow-sm"
                    placeholder="Ej: Av. Libertador Bernardo O'Higgins"
                  />
                  <InputError message={errors.street} />
                </div>
                <div className="space-y-1">
                  <label className="ml-1 enterprise-label opacity-60">
                    Número / Depto
                  </label>
                  <TextInput
                    value={data.number}
                    onChange={(e) => setData("number", e.target.value)}
                    className="w-full !rounded-2xl !py-4 font-bold bg-white shadow-sm"
                    placeholder="Ej: 1234, Depto 501"
                  />
                  <InputError message={errors.number} />
                </div>
              </div>
            </div>
          )}

          {/* BLOQUE 2: CONTACTO & OCUPACIÓN */}
          {!data.require_tutor && (
            <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-[2.5rem] space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-brand-primary/5 blur-3xl"></div>
              <h3 className="enterprise-label !text-brand-primary flex items-center gap-2 relative z-10">
                <Smartphone className="w-4 h-4" /> Contactabilidad & Profesión
              </h3>
              <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="space-y-1">
                  <label className="ml-1 enterprise-label opacity-60">
                    Ocupación
                  </label>
                  <TextInput
                    value={data.occupation}
                    onChange={(e) => setData("occupation", e.target.value)}
                    className="w-full !rounded-2xl !py-4 font-bold bg-white"
                    placeholder="Ej: Ingeniero"
                  />
                  <InputError message={errors.occupation} />
                </div>
                <div className="space-y-1">
                  <label className="ml-1 enterprise-label opacity-60">
                    Correo Electrónico
                  </label>
                  <TextInput
                    type="email"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    className="w-full !rounded-2xl !py-4 font-bold bg-white"
                    placeholder="ejemplo@correo.com"
                  />
                  <InputError message={errors.email} />
                </div>
                <div className="space-y-1">
                  <label className="ml-1 enterprise-label opacity-60">
                    Teléfono Directo
                  </label>
                  <ChilePhoneInput
                    value={data.phone}
                    onChange={(v) => setData("phone", v)}
                    className="w-full"
                  />
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
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="ml-1 enterprise-label opacity-60">
                    RUT del Responsable
                  </label>
                  <RutInput
                    value={data.guardian_rut}
                    onChange={(v) => setData("guardian_rut", v)}
                    className="w-full !rounded-2xl !py-1 font-black bg-white"
                  />
                  <InputError message={errors.guardian_rut} />
                </div>
                <div className="space-y-1">
                  <label className="ml-1 enterprise-label opacity-60">
                    Nombre Completo
                  </label>
                  <TextInput
                    value={data.guardian_name}
                    onChange={(e) => setData("guardian_name", e.target.value)}
                    className="w-full !rounded-2xl !py-4 font-bold bg-white shadow-sm"
                  />
                  <InputError message={errors.guardian_name} />
                </div>
                <div className="space-y-1">
                  <label className="ml-1 enterprise-label opacity-60">
                    WhatsApp de Cobro
                  </label>
                  <ChilePhoneInput
                    value={data.guardian_phone}
                    onChange={(v) => setData("guardian_phone", v)}
                    className="w-full"
                  />
                  <InputError message={errors.guardian_phone} />
                </div>
                <div className="space-y-1">
                  <label className="ml-1 enterprise-label opacity-60">
                    Email para Facturación
                  </label>
                  <TextInput
                    type="email"
                    value={data.guardian_email}
                    onChange={(e) => setData("guardian_email", e.target.value)}
                    className="w-full !rounded-2xl !py-4 font-bold bg-white shadow-sm"
                  />
                  <InputError message={errors.guardian_email} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="ml-1 enterprise-label opacity-60">
                    Parentesco con el Paciente
                  </label>
                  <select
                    value={data.guardian_relationship}
                    onChange={(e) =>
                      setData("guardian_relationship", e.target.value)
                    }
                    className="w-full px-5 py-4 text-sm font-bold bg-white border-gray-100 rounded-2xl focus:ring-brand-primary"
                  >
                    <option value="">-- Seleccionar Vínculo --</option>
                    {relationshipOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <InputError message={errors.guardian_relationship} />
                </div>
              </div>
            </div>
          )}

          {/* BLOQUE 4: PREFERENCIAS DE CONECTIVIDAD */}
          <div className="space-y-6">
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> Centro de Notificaciones
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="flex items-center justify-between p-6 transition-all bg-white border border-gray-100 shadow-sm cursor-pointer rounded-3xl hover:border-brand-primary/30 group">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-xl transition-colors ${
                      data.opt_out_reminders
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-black leading-none tracking-tight text-gray-900 uppercase">
                      Recordatorios
                    </p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase">
                      Alertas de pago y sesiones
                    </p>
                  </div>
                </div>
                <Switch
                  checked={data.opt_out_reminders}
                  onChange={(e) =>
                    setData("opt_out_reminders", e.target.checked)
                  }
                />
              </label>

              {data.opt_out_reminders && (
                <div className="flex items-center justify-around p-6 duration-300 border bg-brand-primary/5 border-brand-primary/10 rounded-3xl animate-in zoom-in-95">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={data.prefers_whatsapp}
                      onChange={(e) =>
                        setData("prefers_whatsapp", e.target.checked)
                      }
                      className="w-5 h-5 border-gray-200 rounded-lg text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-[10px] font-black text-brand-gray uppercase tracking-widest group-hover:text-brand-primary transition-colors">
                      WhatsApp
                    </span>
                  </label>
                  <div className="w-px h-6 bg-brand-primary/10"></div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={data.prefers_mail}
                      onChange={(e) =>
                        setData("prefers_mail", e.target.checked)
                      }
                      className="w-5 h-5 border-gray-200 rounded-lg text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-[10px] font-black text-brand-gray uppercase tracking-widest group-hover:text-brand-primary transition-colors">
                      Email
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER FIJO PREMIUM */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4 shrink-0 rounded-b-[2.5rem]">
          <SecondaryButton
            onClick={() => {
              reset();
              setOpenModalPatient(false);
            }}
            type="button"
            className="!px-10 !py-4"
          >
            Descartar
          </SecondaryButton>
          <PrimaryButton
            disabled={processing}
            type="submit"
            className="!px-14 !py-4 shadow-xl shadow-brand-primary/20"
          >
            {processing
              ? "Sincronizando..."
              : data.id || isExistingInSystem
              ? "Actualizar Ficha"
              : "Registrar Paciente"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
