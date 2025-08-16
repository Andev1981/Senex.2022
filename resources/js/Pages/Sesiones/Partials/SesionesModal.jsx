import React, { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import { Switch } from "@headlessui/react";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import InputPesoChileno from "@/Components/InputPesoChileno";
import moment from "moment";
import TextInputNumber from "@/Components/TextInputNumber";
import { User } from "lucide-react";

function SesionesModal({ sesion, kines, apply_types, setModalSesionesOption }) {
  const { data, setData, errors, post, put, reset, processing } = useForm({
    id: sesion?.id,
    doctor_id: Number(sesion?.doctor_id) || "",
    comments: sesion?.comments || "",
    patient_id: sesion?.patient_id || "",
    price: sesion?.price || 0,
    fecha_atencion: sesion?.fecha_atencion
      ? moment.utc(sesion.fecha_atencion).format("YYYY-MM-DD")
      : moment.utc(Date.now()).format("YYYY-MM-DD"),
    numero_sesion: Number(sesion?.numero_sesion) || 0,
    application_type_id: sesion?.application_type_id || "",
    application_id: sesion?.application_id || "",
    status: sesion?.status,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (data.id) {
      post(route("sesiones.update", data.id), {
        onSuccess: () => {
          setModalSesionesOption(false);
          reset();
        },
        onError: (errors) => {},
      });
    } else {
      post(route("sesiones.store"), {
        onSuccess: () => {
          setModalSesionesOption(false);
          reset();
        },
        onError: (errors) => {},
      });
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePrice = (e) => {
    console.log("E: ", e);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="px-4 flex items-center gap-2 font-bold">
        <User className="w-5 h-5 text-primary shadow-xl border border-gray-400 rounded-xl" />
        {sesion.patient_name + " " + sesion.patient_last_name}
      </div>
      <div className="grid grid-cols-3 gap-4 px-4 pt-2">
        <div>
          <InputLabel
            htmlFor="kine"
            value="Kine"
            className="ml-2 text-primary"
          />
          <select
            id="doctor_id"
            name="doctor_id"
            value={data.doctor_id}
            onChange={(e) => setData("doctor_id", e.target.value)}
            className="rounded-md w-full border-gray-100 shadow-sm focus:border-primary/20 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-primary dark:focus:ring-primary/20 border-[0.5px] "
            required
          >
            {!data?.doctor_id && <option>--Selecciona Kine--</option>}
            {kines.map((kine) => (
              <option key={kine.id} value={kine.id}>
                {kine.name + " " + kine.last_name}
              </option>
            ))}
          </select>
          <InputError message={errors.doctor_id} className="mt-2" />
        </div>
        <div>
          <InputLabel
            htmlFor="tipo"
            value="Tipo de Atención"
            className="ml-2 text-primary"
          />
          <select
            id="application_type_id"
            name="application_type_id"
            value={data?.application_type_id}
            onChange={(e) => {
              setData("application_type_id", e.target.value),
                hadlePrice(e.target.value);
            }}
            className="rounded-md w-full border-gray-100 shadow-sm focus:border-primary/20 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-primary dark:focus:ring-primary/20 border-[0.5px] "
            required
          >
            {!data?.application_type_id && <option>--Tipo Atención --</option>}
            {apply_types.map((apply_type) => (
              <option key={apply_type.id} value={apply_type.id}>
                {apply_type.name}
              </option>
            ))}
          </select>
          <InputError message={errors.application_type_id} className="mt-2" />
        </div>
        <div>
          <InputLabel
            htmlFor="status"
            value="Estado de Atención"
            className="ml-2 text-primary"
          />
          <select
            id="status"
            value={data.status ?? ""} // Mantiene controlado el valor
            onChange={(e) => setData("status", parseInt(e.target.value))}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
             focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
             dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
             dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="">-- Seleccione estado --</option>
            <option value={0}>PENDIENTE</option>
            <option value={1}>ATENDIDO</option>
            <option value={2}>CANCELADO</option>
            <option value={3}>REAGENDADO</option>
          </select>
          <InputError message={errors?.status} className="mt-2" />
        </div>
        <div>
          <InputLabel
            htmlFor="fecha"
            value="Fecha"
            className="ml-2 text-primary"
          />
          <TextInput
            type="date"
            id="fecha_atencion"
            name="fecha_atencion"
            value={data?.fecha_atencion}
            onChange={(e) => handleChange(e)}
            required
            className="w-full"
          />
          <InputError message={errors?.fecha_atencion} className="mt-2" />
        </div>
        <div>
          <InputLabel
            htmlFor="price"
            value="Precio"
            className="ml-2 text-primary"
          />
          <InputPesoChileno
            name="price"
            price={data.price}
            onChange={handleChange} // funciona directo
            required
            className="w-full"
          />
          <InputError message={errors?.price} className="mt-2" />
        </div>
        <div>
          <InputLabel
            htmlFor="numero_sesion"
            value="Numero de Sesión"
            className="ml-2 text-primary"
          />
          <TextInputNumber
            type="number"
            id="numero_sesion"
            name="numero_sesion"
            label="Número de Sesión"
            value={data.numero_sesion}
            onChange={(e) => handleChange(e)}
            required
            className="w-full"
            min={0}
          />
          <InputError message={errors?.numero_sesion} className="mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 pb-4">
        <div className="mb-4">
          <InputLabel
            htmlFor="comments"
            value="Comentarios"
            className="ml-2 text-primary"
          />
          <textarea
            id="comments"
            name="comments"
            value={data.comments}
            onChange={(e) => setData("brecha", e.target.value)}
            rows="4"
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Ingrese comentario..."
          ></textarea>
        </div>
      </div>
      <hr />
      <div className="flex justify-end gap-3 px-4 my-4">
        <SecondaryButton
          type="button"
          variant="outline"
          onClick={() => (reset(), setModalSesionesOption(false))}
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

export default SesionesModal;
