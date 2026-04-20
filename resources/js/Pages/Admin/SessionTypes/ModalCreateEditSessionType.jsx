import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import InputLabel from "@/components/InputLabel";
import InputError from "@/components/InputError";
import TextInput from "@/components/TextInput";
import InputPesoChileno from "@/components/InputPesoChileno";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

function ModalCreateEditSessionType({ sessionType, onClose }) {
  // Form base
  const {
    data,
    setData,
    errors,
    post,
    put,
    reset,
    processing,
    transform,
    clearErrors,
  } = useForm({
    id: sessionType?.id ?? null,
    name: sessionType?.name ?? "",
    base_price: sessionType?.base_price ?? 0,
    duration_minutes: sessionType?.duration_minutes ?? 45,
    plan_eligible: sessionType?.plan_eligible ?? true,
    plan_session_value: sessionType?.plan_session_value ?? 1,
    is_active: sessionType?.is_active ?? true,
  });

  // Si cambian props (abrir modal con otro item), sincroniza el form
  useEffect(() => {
    setData({
      id: sessionType?.id ?? null,
      name: sessionType?.name ?? "",
      base_price: sessionType?.base_price ?? 0,
      duration_minutes: sessionType?.duration_minutes ?? 45,
      plan_eligible: sessionType?.plan_eligible ?? true,
      plan_session_value: sessionType?.plan_session_value ?? 1,
      is_active: sessionType?.is_active ?? true,
    });
    clearErrors();
  }, [sessionType]);

  // Normaliza payload antes de enviar (evita strings en números/booleans)
  transform((payload) => ({
    ...payload,
    base_price: Number(payload.base_price ?? 0),
    duration_minutes: payload.duration_minutes
      ? Number(payload.duration_minutes)
      : null,
    plan_eligible: !!payload.plan_eligible,
    plan_session_value: Number(payload.plan_session_value ?? 1),
    is_active: !!payload.is_active,
  }));

  // Handlers
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "number") {
      // Permite vacío temporal para no pelear con el usuario
      setData(name, value === "" ? "" : Number(value));
    } else {
      setData(name, value);
    }
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setData(name, checked);
  };

  // Para InputPesoChileno si emite { target: { name, value } }
  const handlePeso = (e) => {
    const { name, value } = e.target;
    // value debiera venir como número limpio (sin separadores). Ajusta si tu componente retorna string.
    setData(name, value === "" ? 0 : Number(value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const onSuccess = () => {
      reset();
      onClose?.(false);
    };

    if (data.id) {
      // OJO: con useForm no necesitas pasar { data }, el form ya lo conoce
      put(route("session-types.update", data.id), {
        preserveScroll: true,
        onSuccess,
      });
    } else {
      post(route("session-types.store"), {
        preserveScroll: true,
        onSuccess,
      });
    }
  };

  const handleCancel = () => {
    reset();
    onClose?.(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 pt-2">
        {/* Nombre */}
        <div className="md:col-span-1">
          <InputLabel
            htmlFor="name"
            value="Nombre"
            className="ml-2 text-primary"
          />
          <TextInput
            id="name"
            name="name"
            type="text"
            value={data.name}
            onChange={handleChange}
            required
            className="w-full"
            disabled={processing}
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

        {/* Duración cantidad (min) */}
        <div className="md:col-span-1">
          <InputLabel
            htmlFor="duration_minutes"
            value="Duración (min)"
            className="ml-2 text-primary"
          />
          <TextInput
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min="1"
            max="600"
            value={data.duration_minutes}
            onChange={handleChange}
            className="w-full"
            disabled={processing}
          />
          <InputError message={errors?.duration_minutes} className="mt-2" />
        </div>

        {/* Cantidad de sesiones */}
        <div className="md:col-span-1">
          <InputLabel
            htmlFor="plan_session_value"
            value="Cantidad de sesiones"
            className="ml-2 text-primary"
          />
          <TextInput
            id="plan_session_value"
            name="plan_session_value"
            type="number"
            step="0.1"
            min="0.1"
            max="10"
            value={data.plan_session_value}
            onChange={handleChange}
            className="w-full"
            disabled={processing}
          />
          <InputError message={errors?.plan_session_value} className="mt-2" />
        </div>

        {/* Plan elegible */}
        <div className="md:col-span-1">
          <InputLabel
            htmlFor="plan_eligible"
            value="Apto para planes"
            className="ml-2 text-primary"
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
              Permite descontar de planes/prepagos
            </span>
          </div>
          <InputError message={errors?.plan_eligible} className="mt-2" />
        </div>

        {/* Estado */}
        <div className="md:col-span-1">
          <InputLabel
            htmlFor="is_active"
            value="Estado"
            className="ml-2 text-primary"
          />
          <div className="flex items-center gap-2">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={!!data.is_active}
              onChange={handleCheckbox}
              className="h-5 w-5"
              disabled={processing}
            />
            <span className="text-sm text-gray-700">
              {data.is_active ? "Activo" : "Inactivo"}
            </span>
          </div>
          <InputError message={errors?.is_active} className="mt-2" />
        </div>
      </div>

      <hr className="mt-2" />

      <div className="flex justify-end gap-3 px-4 py-3">
        <SecondaryButton
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={processing}
        >
          Cancelar
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={processing}>
          {data.id ? "Actualizar" : "Crear"}
        </PrimaryButton>
      </div>
    </form>
  );
}

export default ModalCreateEditSessionType;
