import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import {
  Calendar,
  FileText,
  Activity,
  Tag,
  Hash,
  Stethoscope,
} from "lucide-react"; // Added Stethoscope icon
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import InputPesoChileno from "@/Components/InputPesoChileno";
import Swal from "sweetalert2";

// 1. Definimos las opciones disponibles
const CATEGORIES = [
  { value: "kinesiology", label: "Kinesiología" },
  { value: "evaluation", label: "Evaluación" },
  { value: "procedure", label: "Procedimiento" },
  { value: "massage", label: "Masaje" },
  { value: "other", label: "Otro" },
];

export default function SessionTypeModal({ setIsModalOpen, selectedType }) {
  const { data, setData, put, post, processing, errors, reset } = useForm({
    id: selectedType?.id || "",
    name: selectedType?.name || "",
    code: selectedType?.code || "",
    category: selectedType?.category || "",

    base_price_clp: selectedType?.base_price_clp || 0,
    plan_discount_clp: selectedType?.plan_discount_clp || 0,
    duration_minutes: selectedType?.duration_minutes || 45,

    // NEW: Campo para la comisión estándar del doctor
    default_doctor_commission_clp:
      selectedType?.default_doctor_commission_clp || 0,

    requires_diagnosis: selectedType?.requires_diagnosis ? true : false,
    requires_referral: selectedType?.requires_referral ? true : false,
    is_active: selectedType?.is_active ? true : false,
  });

  useEffect(() => {
    if (selectedType) {
      setData({
        id: selectedType.id,
        name: selectedType.name || "",
        code: selectedType.code || "",
        category: selectedType.category || "",
        base_price_clp: selectedType.base_price_clp || 0,
        plan_discount_clp: selectedType.plan_discount_clp || 0,
        duration_minutes: selectedType.duration_minutes || 45,
        // NEW: Init value
        default_doctor_commission_clp:
          selectedType.default_doctor_commission_clp || 0,
        requires_diagnosis: Boolean(selectedType.requires_diagnosis),
        requires_referral: Boolean(selectedType.requires_referral),
        is_active: Boolean(selectedType.is_active),
      });
    }
  }, [selectedType]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const isEdit = !!selectedType?.id;
    const routeName = isEdit ? "session-types.update" : "session-types.store";
    const url = isEdit ? route(routeName, selectedType.id) : route(routeName);
    const method = isEdit ? put : post;

    method(url, {
      onSuccess: () => {
        setIsModalOpen(false);
        reset();
        Swal.fire({
          title: isEdit ? "¡Actualizado!" : "¡Creado!",
          text: isEdit
            ? "Sesión actualizada correctamente."
            : "Sesión creada correctamente.",
          icon: "success",
          confirmButtonColor: "#2563EB",
          timer: 2000,
          timerProgressBar: true,
        });
      },
      onError: () => {
        Swal.fire({
          title: "Error",
          text: "Revisa los campos marcados en rojo.",
          icon: "error",
          confirmButtonColor: "#EF4444",
        });
      },
    });
  };

  const handlePeso = (e) => {
    const { name, value } = e.target;
    setData(name, value === "" ? 0 : Number(value));
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setData(name, checked);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- SECCIÓN 1: Identificación --- */}
        <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            Datos Principales
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* NOMBRE */}
            <div className="md:col-span-2">
              <InputLabel htmlFor="name" value="Nombre de la Sesión *" />
              <TextInput
                id="name"
                name="name"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                required
                className="w-full"
                placeholder="Ej: Kinesiología General"
              />
              <InputError message={errors.name} className="mt-2" />
            </div>

            {/* CÓDIGO */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Hash className="w-4 h-4 text-gray-500" />
                <InputLabel
                  htmlFor="code"
                  value="Código Interno"
                  className="mb-0"
                />
              </div>
              <TextInput
                id="code"
                name="code"
                value={data.code}
                onChange={(e) => setData("code", e.target.value)}
                className="w-full uppercase"
                placeholder="Ej: KINE-001"
              />
              <InputError message={errors.code} className="mt-2" />
            </div>

            {/* CATEGORÍA */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Tag className="w-4 h-4 text-gray-500" />
                <InputLabel
                  htmlFor="category"
                  value="Categoría"
                  className="mb-0"
                />
              </div>
              <select
                id="category"
                name="category"
                value={data.category}
                onChange={(e) => setData("category", e.target.value)}
                className="w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
              >
                <option value="">-- Seleccione Categoría --</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <InputError message={errors.category} className="mt-2" />
            </div>
          </div>
        </div>

        {/* --- SECCIÓN 2: Valores y Tiempo --- */}
        <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <Calendar className="w-5 h-5 text-green-600" />
            Configuración Económica
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {" "}
            {/* Ajustado grid para acomodar nuevo campo */}
            {/* PRECIO BASE */}
            <div>
              <InputLabel
                htmlFor="base_price_clp"
                value="Precio Particular (CLP) *"
              />
              <InputPesoChileno
                id="base_price_clp"
                name="base_price_clp"
                price={data.base_price_clp}
                onChange={handlePeso}
                required
                className="w-full font-bold text-gray-900"
              />
              <InputError message={errors.base_price_clp} className="mt-2" />
            </div>
            {/* NUEVO: COMISIÓN ESTÁNDAR DOCTOR */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Stethoscope className="w-3.5 h-3.5 text-purple-500" />
                <InputLabel
                  htmlFor="default_doctor_commission_clp"
                  value="Pago Base Kinesiólogo"
                  className="mb-0 text-purple-700"
                />
              </div>
              <InputPesoChileno
                id="default_doctor_commission_clp"
                name="default_doctor_commission_clp"
                price={data.default_doctor_commission_clp}
                onChange={handlePeso}
                className="w-full border-purple-200 focus:ring-purple-500 focus:border-purple-500 bg-purple-50"
                placeholder="$0"
                required
              />
              <p className="text-[10px] text-gray-500 mt-1">
                * Valor por defecto. Editable por profesional.
              </p>
              <InputError
                message={errors.default_doctor_commission_clp}
                className="mt-2"
              />
            </div>
            {/* DESCUENTO PLAN */}
            <div>
              <InputLabel
                htmlFor="plan_discount_clp"
                value="Descuento por Plan (CLP)"
              />
              <InputPesoChileno
                id="plan_discount_clp"
                name="plan_discount_clp"
                price={data.plan_discount_clp}
                onChange={handlePeso}
                className="w-full text-gray-500"
              />
              <InputError message={errors.plan_discount_clp} className="mt-2" />
            </div>
            {/* DURACIÓN */}
            <div>
              <InputLabel htmlFor="duration_minutes" value="Duración (min) *" />
              <div className="relative">
                <input
                  type="number"
                  id="duration_minutes"
                  min="15"
                  step="15"
                  value={data.duration_minutes}
                  onChange={(e) =>
                    setData("duration_minutes", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
                <span className="absolute text-gray-500 right-3 top-2">
                  min
                </span>
              </div>
              <InputError message={errors.duration_minutes} className="mt-2" />
            </div>
          </div>
        </div>

        {/* --- SECCIÓN 3: Reglas y Estado --- */}
        <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700 bg-yellow-50/50 dark:bg-yellow-900/10">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <Activity className="w-5 h-5 text-yellow-600" />
            Reglas de Negocio
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              {/* DIAGNÓSTICO */}
              <label className="flex items-center p-2 space-x-3 transition-colors rounded-lg cursor-pointer hover:bg-white dark:hover:bg-gray-800">
                <input
                  type="checkbox"
                  name="requires_diagnosis"
                  checked={!!data.requires_diagnosis}
                  onChange={handleCheckbox}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Requiere Diagnóstico Previo
                </span>
              </label>

              {/* DERIVACIÓN */}
              <label className="flex items-center p-2 space-x-3 transition-colors rounded-lg cursor-pointer hover:bg-white dark:hover:bg-gray-800">
                <input
                  type="checkbox"
                  name="requires_referral"
                  checked={!!data.requires_referral}
                  onChange={handleCheckbox}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Requiere Derivación Médica
                </span>
              </label>
            </div>

            {/* ESTADO (Switch) */}
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estado Actual
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={!!data.is_active}
                    onChange={handleCheckbox}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-bold text-gray-900 dark:text-white">
                    {data.is_active ? "ACTIVO" : "INACTIVO"}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => {
              reset();
              setIsModalOpen(false);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            disabled={processing}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            disabled={processing}
          >
            {processing && (
              <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
            )}
            {selectedType?.id ? "Guardar Cambios" : "Crear Sesión"}
          </button>
        </div>
      </form>
    </div>
  );
}
