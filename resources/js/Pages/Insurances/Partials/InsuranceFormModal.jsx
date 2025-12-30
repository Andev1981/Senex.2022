import { useForm } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import ChilePhoneInput from "@/Components/ChilePhoneInput";
import RutInput from "@/Components/RutInput";
import Switch from "@/Components/Switch";
import {
  BrickWallShield,
  Database,
  Mail,
  Phone,
  Globe,
  CheckCircle2,
  XCircle,
  Building2,
  Fingerprint,
  AlertCircle,
} from "lucide-react";

function InsuranceFormModal({ insurance, onClose }) {
  const isEdit = !!insurance?.id;

  const { data, setData, errors, post, put, reset, processing } = useForm({
    id: insurance?.id,
    name: insurance?.name || "",
    rut: insurance?.rut || "",
    institution_type: insurance?.institution_type || "clinic",
    phone: insurance?.phone || "",
    email: insurance?.email || "",
    address: insurance?.address || "",
    website: insurance?.website || "",
    is_active: insurance?.is_active ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = isEdit
      ? route("insurances.update", data.id)
      : route("insurances.store");
    const method = isEdit ? put : post;

    method(url, {
      onSuccess: () => {
        onClose();
        reset();
      },
    });
  };

  return (
    <div className="bg-white">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* HEADER HERO */}
        <div className="p-8 bg-gray-50/50 border-b border-gray-100 rounded-t-[2rem] flex items-center justify-between gap-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-brand-primary text-white rounded-2xl shadow-xl shadow-brand-primary/20 transform rotate-3">
              <BrickWallShield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="mb-1 text-2xl font-black leading-none tracking-tight text-gray-900 uppercase">
                {isEdit ? "Optimizar Previsión" : "Nueva Aseguradora"}
              </h2>
              <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
                Configuración Maestra de Convenio
              </p>
            </div>
          </div>
          {isEdit && (
            <div
              className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${
                data.is_active
                  ? "bg-green-50 border-green-100 text-green-600"
                  : "bg-red-50 border-red-100 text-red-600"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {data.is_active ? "Operativa" : "Suspendida"}
              </span>
            </div>
          )}
        </div>

        <div className="p-10 space-y-10">
          {/* BLOQUE 1: IDENTIDAD FISCAL */}
          <div className="space-y-6">
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
              <Fingerprint className="w-4 h-4" /> Identificación Fiscal &
              Comercial
            </h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
              <div className="space-y-1 md:col-span-12">
                <label className="ml-1 enterprise-label opacity-60">
                  Tipo de Institución
                </label>
                <select
                  value={data.institution_type}
                  onChange={(e) => setData("institution_type", e.target.value)}
                  className="w-full px-5 py-4 text-sm font-bold border-gray-100 rounded-2xl bg-white shadow-inner focus:ring-brand-primary focus:border-brand-primary"
                >
                  <option value="health_insurer">Isapre / Fonasa</option>
                  <option value="insurance_company">Compañía de Seguros</option>
                  <option value="clinic">Clínica / Prestador</option>
                </select>
                <InputError message={errors.institution_type} />
              </div>
              <div className="space-y-1 md:col-span-8">
                <label className="ml-1 enterprise-label opacity-60">
                  Razón Social / Institución
                </label>
                <TextInput
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  required
                  className="w-full !rounded-2xl !py-4 font-black uppercase text-sm shadow-inner"
                  placeholder="EJ: ISAPRE BANMÉDICA S.A."
                />
                <InputError message={errors.name} />
              </div>
              <div className="space-y-1 md:col-span-4">
                <label className="ml-1 enterprise-label opacity-60">
                  RUT Institucional
                </label>
                <RutInput
                  value={data.rut}
                  onChange={(v) => setData("rut", v)}
                  className="w-full !rounded-2xl !py-4 font-mono font-black"
                />
                <InputError message={errors.rut} />
              </div>
            </div>
          </div>

          {/* BLOQUE 2: CONTACTO & CANALES */}
          <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-[2.5rem] space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-brand-primary/5 blur-2xl"></div>
            <h3 className="enterprise-label !text-brand-primary flex items-center gap-2 relative z-10">
              <Globe className="w-4 h-4" /> Canales de Comunicación
            </h3>
            <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-1">
                <label className="ml-1 enterprise-label opacity-60">
                  Correo Electrónico Corporativo
                </label>
                <div className="relative">
                  <Mail className="absolute w-4 h-4 -translate-y-1/2 left-4 top-1/2 text-brand-gray opacity-40" />
                  <TextInput
                    type="email"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    className="w-full !pl-12 !rounded-2xl !py-4 font-bold bg-white"
                    placeholder="contacto@aseguradora.cl"
                  />
                </div>
                <InputError message={errors.email} />
              </div>
              <div className="space-y-1">
                <label className="ml-1 enterprise-label opacity-60">
                  Teléfono de Soporte
                </label>
                <ChilePhoneInput
                  value={data.phone}
                  onChange={(v) => setData("phone", v)}
                  className="w-full"
                />
                <InputError message={errors.phone} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="ml-1 enterprise-label opacity-60">
                  Dirección Administrativa
                </label>
                <div className="relative">
                  <Building2 className="absolute w-4 h-4 -translate-y-1/2 left-4 top-1/2 text-brand-gray opacity-40" />
                  <TextInput
                    value={data.address}
                    onChange={(e) => setData("address", e.target.value)}
                    className="w-full !pl-12 !rounded-2xl !py-4 font-bold bg-white"
                    placeholder="Av. Providencia 1234, Oficina 501"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BLOQUE 3: ESTADO OPERATIVO */}
          <div className="flex items-center justify-between p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
            <div className="flex items-center gap-4">
              <div
                className={`p-2 rounded-xl transition-colors ${
                  data.is_active
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="mb-1 text-xs font-black leading-none tracking-tight text-gray-900 uppercase">
                  Estado de Disponibilidad
                </p>
                <p className="text-[8px] font-bold text-gray-400 uppercase">
                  Habilitar para ventas y convenios
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${
                  data.is_active ? "text-green-600" : "text-red-600"
                }`}
              >
                {data.is_active ? "SISTEMA ACTIVO" : "SISTEMA BAJA"}
              </span>
              <Switch
                checked={data.is_active}
                onChange={(e) => setData("is_active", e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* FOOTER PREMIUM */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4 shrink-0 rounded-b-[2rem]">
          <SecondaryButton
            onClick={() => {
              reset();
              onClose();
            }}
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
              : isEdit
              ? "Actualizar Aseguradora"
              : "Registrar Entidad"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}

export default InsuranceFormModal;
