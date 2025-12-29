import React from "react";
import { useForm } from "@inertiajs/react";
import {
  ShieldCheck,
  Lock,
  Key,
  Globe,
  X,
  Upload,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";

export default function DteConfigModal({
  isOpen,
  onClose,
  company,
  dteConfig,
}) {
  const { data, setData, post, processing, errors } = useForm({
    rut_empresa: dteConfig?.rut_empresa || company.rut,
    ambiente: dteConfig?.ambiente || "homologacion",
    certificado_password: "",
    certificado_file: null,
    simulation_mode: dteConfig ? !!dteConfig.simulation_mode : true, // Por defecto true para nuevas
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("companies.dte_config.store", company.id), {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Configuración Certificado Digital DTE"
      maxWidth="3xl"
    >
      <form onSubmit={submit} className="p-8 space-y-8">
        {/* MODAL SIMULACIÓN (ALERTA PREMIUM) */}
        <div
          className={`p-6 rounded-3xl border-2 transition-all duration-500 ${
            data.simulation_mode
              ? "bg-amber-50 border-amber-100 shadow-lg shadow-amber-200/20"
              : "bg-green-50 border-green-100 shadow-lg shadow-green-200/20"
          }`}
        >
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-2xl shadow-sm ${
                  data.simulation_mode
                    ? "bg-white text-amber-600"
                    : "bg-white text-green-600"
                }`}
              >
                {data.simulation_mode ? (
                  <RefreshCw className="w-6 h-6 animate-spin-slow" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
              </div>
              <div>
                <p
                  className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                    data.simulation_mode ? "text-amber-700" : "text-green-700"
                  }`}
                >
                  Estatus del Motor DTE
                </p>
                <p
                  className={`text-base font-black uppercase tracking-tight leading-none ${
                    data.simulation_mode ? "text-amber-900" : "text-green-900"
                  }`}
                >
                  {data.simulation_mode
                    ? "Modo Simulación Activo"
                    : "Operación Real SII"}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer group">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={data.simulation_mode}
                onChange={(e) => setData("simulation_mode", e.target.checked)}
              />
              <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <p className="mt-4 text-[11px] font-medium leading-relaxed opacity-70">
            {data.simulation_mode
              ? "Permite emitir documentos de prueba sin validez fiscal. Ideal para capacitación y configuración inicial del flujo de caja."
              : "Las emisiones serán enviadas oficialmente al SII. Requiere Certificado Digital vigente y folios CAF cargados."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="ml-1 enterprise-label">
                RUT Empresa Emisora
              </label>
              <input
                type="text"
                value={data.rut_empresa}
                onChange={(e) => setData("rut_empresa", e.target.value)}
                placeholder="76.123.123-K"
                className="w-full border-gray-200 rounded-xl focus:ring-brand-primary"
              />
              {errors.rut_empresa && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.rut_empresa}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="ml-1 enterprise-label">
                Ambiente de Operación
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setData("ambiente", "homologacion")}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    data.ambiente === "homologacion"
                      ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                      : "border-gray-100 text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Certificación
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setData("ambiente", "produccion")}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    data.ambiente === "produccion"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-100 text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Producción
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <label className="ml-1 enterprise-label">
                Certificado Digital (.pfx / .p12)
              </label>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center gap-2 ${
                  data.certificado_file
                    ? "border-brand-primary bg-brand-primary/5"
                    : "border-gray-200 bg-gray-50/50"
                }`}
              >
                <input
                  type="file"
                  accept=".pfx,.p12"
                  onChange={(e) =>
                    setData("certificado_file", e.target.files[0])
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Key
                  className={`w-8 h-8 ${
                    data.certificado_file
                      ? "text-brand-primary"
                      : "text-gray-300"
                  }`}
                />
                <p className="text-[11px] font-bold text-gray-600 text-center">
                  {data.certificado_file
                    ? data.certificado_file.name
                    : "Subir nuevo certificado"}
                </p>
              </div>
              {errors.certificado_file && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.certificado_file}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="ml-1 enterprise-label">
                Contraseña del Certificado
              </label>
              <div className="relative">
                <Lock className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                <input
                  type="password"
                  value={data.certificado_password}
                  onChange={(e) =>
                    setData("certificado_password", e.target.value)
                  }
                  placeholder="••••••••"
                  className="w-full pl-10 border-gray-200 rounded-xl focus:ring-brand-primary"
                />
              </div>
              {errors.certificado_password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.certificado_password}
                </p>
              )}
            </div>
          </div>
        </div>

        {dteConfig?.fecha_caducidad && (
          <div className="flex items-center gap-3 p-4 mt-6 border border-orange-100 bg-orange-50 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <p className="text-xs font-medium text-orange-800">
              El certificado actual expira el:{" "}
              <strong>
                {new Date(dteConfig.fecha_caducidad).toLocaleDateString()}
              </strong>
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-gray-100">
          <SecondaryButton onClick={onClose} type="button">
            Cancelar
          </SecondaryButton>
          <PrimaryButton disabled={processing} className="!px-10">
            {processing ? "Guardando..." : "Guardar Configuración"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
