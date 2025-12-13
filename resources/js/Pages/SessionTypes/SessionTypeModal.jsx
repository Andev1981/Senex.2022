import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Calendar } from "lucide-react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import InputPesoChileno from "@/Components/InputPesoChileno";

export default function SessionTypeModal({ setIsModalOpen, selectedType }) {
  const { data, setData, put, post, processing, errors, reset } = useForm({
    id: selectedType?.id || "",
    name: selectedType?.name || "",
    base_price: selectedType?.base_price || 0,
    duration_minutes: selectedType?.duration || 45,
    plan_eligible: selectedType?.plan_eligible || false,
    plan_session_value: selectedType?.plan_session_value || 0,
    active: selectedType?.active || false,
  });

  useEffect(() => {
    if (selectedType) {
      setData({
        id: selectedType?.id || "",
        name: selectedType?.name || "",
        base_price: selectedType?.base_price || 0,
        duration_minutes: selectedType?.duration || 45,
        plan_eligible: selectedType?.plan_eligible || false,
        plan_session_value: selectedType?.plan_session_value || 0,
        active: selectedType?.active || false,
      });
    }
  }, [selectedType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedType?.id) {
      put(route("session-types.update", selectedType.id), {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        },
        onError: () => {
          alert(errors.general || "Ocurrió un error al actualizar la sesión.");
        },
      });
    } else {
      post(route("sessions-types.store"), {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        },
        onError: () => {
          alert(errors.general || "Ocurrió un error al crear la sesión.");
        },
      });
    }
  };

  const handlePeso = (e) => {
    const { name, value } = e.target;
    // value debiera venir como número limpio (sin separadores). Ajusta si tu componente retorna string.
    setData(name, value === "" ? 0 : Number(value));
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setData(name, checked);
  };

  const handleCancel = () => {
    reset();
    setIsModalOpen(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Calendar className="w-5 h-5 text-blue-600" />
            Información Básica{" "}
          </h3>
          <hr className="my-4" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <InputLabel
                htmlFor="name"
                value="Nombre"
                className="ml-2 text-primary"
              />
              <TextInput
                type="text"
                id="name"
                name="name"
                value={data?.name}
                onChange={(e) => setData("name", e.target.value)}
                required
                className="w-full"
              />
              <InputError message={errors?.name} className="mt-2" />
            </div>

            {/* Precio base (CLP) */}
            <div className="md:col-span-1">
              <InputLabel
                htmlFor="base_price"
                value="Precio base (CLP)"
                className="ml-2 text-primary"
              />
              <InputPesoChileno
                id="base_price"
                name="base_price"
                price={data.base_price}
                onChange={handlePeso} // tu componente envía { target: { name, value } }
                required
                className="w-full"
                disabled={processing}
              />
              <InputError message={errors?.base_price} className="mt-2" />
            </div>

            {/* Precio Plan (CLP) */}
            <div className="md:col-span-1">
              <InputLabel
                htmlFor="plan_session_value"
                value="Precio Plan (CLP)"
                className="ml-2 text-primary"
              />
              <InputPesoChileno
                id="plan_session_value"
                name="plan_session_value"
                price={data.plan_session_value}
                onChange={handlePeso} // tu componente envía { target: { name, value } }
                required
                className="w-full"
                disabled={processing}
              />
              <InputError
                message={errors?.plan_session_value}
                className="mt-2"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Duración (minutos) *
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={data.duration_minutes}
                onChange={(e) =>
                  setData("duration_minutes", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              {errors.duration_minutes && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.duration_minutes}
                </p>
              )}
            </div>

            <div>
              <InputLabel
                htmlFor="active"
                value="Estado"
                className="mb-2 text-primary"
              />
              <div className="flex items-center gap-2">
                <input
                  id="active"
                  name="active"
                  type="checkbox"
                  checked={!!data.active}
                  onChange={handleCheckbox}
                  className="h-5 w-5"
                  disabled={processing}
                />
                <span className="text-sm text-gray-700">
                  {data.active ? "Activo" : "Inactivo"}
                </span>
              </div>
              <InputError message={errors?.active} className="mt-2" />
            </div>

            <div>
              <InputLabel
                htmlFor="plan_eligible"
                value="Elegible para plan"
                className="mb-2 text-primary"
              />
              <div className="flex items-center gap-2">
                <input
                  id="plan_eligible"
                  name="plan_eligible"
                  type="checkbox"
                  checked={!!data.plan_eligible}
                  onChange={handleCheckbox}
                  className="h-5 w-5"
                  disabled={processing}
                />
                <span className="text-sm text-gray-700">
                  {data.plan_eligible ? "Elegible" : "No Elegible"}
                </span>
              </div>
              <InputError message={errors?.plan_eligible} className="mt-2" />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            disabled={processing}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={processing}
          >
            {processing
              ? selectedType?.id
                ? "Duplicando..."
                : selectedType?.id
                ? "Actualizando..."
                : "Creando..."
              : selectedType?.id
              ? "Actualizar Tipo de Sesión"
              : "Crear Tipo de Sesión"}
          </button>
        </div>
      </form>
    </div>
  );
}
