import { useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import { useEffect } from "react";
import { fmtDateISO } from "@/utils/utils";
import {
  Handshake,
  Database,
  FileCheck,
  Calendar,
  Hash,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
} from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import Switch from "@/Components/Switch";

export default function AgreementFormModal({
  show,
  onClose,
  agreement,
  insurances,
}) {
  const isEdit = !!agreement;
  const { data, setData, post, put, processing, errors, reset, clearErrors } =
    useForm({
      insurance_id: "",
      name: "",
      version: "1.0",
      is_active: true,
      start_date: "",
    });

  useEffect(() => {
    if (agreement) {
      setData({
        insurance_id: agreement.insurance_id,
        name: agreement.name,
        version: agreement.version,
        is_active: Boolean(agreement.is_active),
        start_date: agreement.start_date,
      });
    } else {
      if (show) {
        reset();
        clearErrors();
      }
    }
  }, [agreement, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = isEdit
      ? route("agreements.update", agreement.id)
      : route("agreements.store");
    const method = isEdit ? put : post;

    method(url, {
      onSuccess: () => onClose(),
      preserveScroll: true,
    });
  };

  return (
    <Modal
      open={show}
      onClose={() => onClose()}
      maxWidth="3xl"
      title={isEdit ? "Optimizar Acuerdo" : "Nuevo Marco Legal"}
      subtitle="Configuración de Convenio Corporativo"
      icon={Handshake}
      footer={
        <>
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
            onClick={handleSubmit}
            type="button"
            className="!px-14 !py-4 shadow-xl shadow-brand-primary/20"
          >
            {processing
              ? "Sincronizando..."
              : isEdit
              ? "Actualizar Acuerdo"
              : "Registrar Convenio"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-10">
        {isEdit && (
          <div className="flex justify-end">
            <div
              className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${
                data.is_active
                  ? "bg-green-50 border-green-100 text-green-600"
                  : "bg-red-50 border-red-100 text-red-600"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {data.is_active ? "Vigente" : "Suspendido"}
              </span>
            </div>
          </div>
        )}
        {/* BLOQUE 1: IDENTIDAD DEL CONTRATO */}
        <div className="space-y-6">
          <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
            <FileCheck className="w-4 h-4" /> Especificaciones del Contrato
          </h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="space-y-1 md:col-span-12">
              <label className="ml-1 enterprise-label opacity-60">
                Aseguradora Mandante
              </label>
              <div className="relative">
                <LinkIcon className="absolute w-4 h-4 -translate-y-1/2 left-4 top-1/2 text-brand-gray opacity-40" />
                <select
                  value={data.insurance_id}
                  onChange={(e) =>
                    setData("insurance_id", parseInt(e.target.value))
                  }
                  className="w-full py-4 pl-12 pr-4 text-sm font-black uppercase border-gray-100 shadow-inner rounded-2xl bg-gray-50 focus:bg-white focus:ring-brand-primary"
                  disabled={isEdit}
                  required
                >
                  <option value="">-- Seleccionar Institución --</option>
                  {insurances?.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.insurance_id && (
                <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">
                  {errors.insurance_id}
                </p>
              )}
            </div>

            <div className="space-y-1 md:col-span-8">
              <label className="ml-1 enterprise-label opacity-60">
                Nombre del Convenio / Campaña
              </label>
              <TextInput
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                required
                className="w-full !rounded-2xl !py-4 font-black uppercase text-sm shadow-inner"
                placeholder="EJ: CONVENIO MARCO PRESTACIONES 2025"
              />
              {errors.name && (
                <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-1 md:col-span-4">
              <label className="ml-1 enterprise-label opacity-60">
                Versión
              </label>
              <div className="relative">
                <Hash className="absolute w-4 h-4 -translate-y-1/2 left-4 top-1/2 text-brand-gray opacity-40" />
                <input
                  type="text"
                  value={data.version}
                  onChange={(e) => setData("version", e.target.value)}
                  className="w-full py-4 pl-12 pr-4 font-mono text-sm font-black border-gray-100 shadow-inner rounded-2xl bg-gray-50 focus:bg-white focus:ring-brand-primary"
                  placeholder="1.0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BLOQUE 2: VIGENCIA & ESTADO */}
        <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-[2.5rem] space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-brand-primary/5 blur-2xl"></div>
          <div className="relative z-10 grid items-end grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-1">
              <label className="enterprise-label !text-brand-primary flex items-center gap-2 ml-1">
                <Calendar className="w-3.5 h-3.5" /> Inicio de Vigencia
              </label>
              <input
                type="date"
                value={fmtDateISO(data.start_date)}
                onChange={(e) => setData("start_date", e.target.value)}
                className="w-full px-5 py-4 font-mono font-black text-gray-700 transition-all bg-white border-gray-100 shadow-sm rounded-2xl focus:ring-brand-primary"
                required
              />
              {errors.start_date && (
                <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">
                  {errors.start_date}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
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
                <div className="text-left">
                  <p className="mb-1 text-xs font-black leading-none tracking-tight text-gray-900 uppercase">
                    Estado Operativo
                  </p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase">
                    Habilitar para facturación
                  </p>
                </div>
              </div>
              <Switch
                checked={data.is_active}
                onChange={(e) => setData("is_active", e.target.checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
