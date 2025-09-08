import React, { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import TextInputNumber from "@/Components/TextInputNumber";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import ChilePhoneInput from "@/Components/ChilePhoneInput";
import RutInput from "@/Components/RutInput";
import moment from "moment";

function ModalCreateEditPatient({ patient, setOpenModalPatient, communes }) {
  const { data, setData, errors, post, put, reset, processing } = useForm({
    id: patient?.id || null,
    name: patient?.name || "",
    last_name: patient?.last_name || "",
    email: patient?.email || "",
    rut: patient?.rut || "",
    birth: patient?.birth_date
      ? moment.utc(patient.birth_date).format("YYYY-MM-DD")
      : moment.utc(Date.now()).format("YYYY-MM-DD"),
    phone: patient?.phone || "",
    address_id: patient?.address_id || "",
    street: patient?.address?.street || "",
    number: patient?.address?.number || "",
    detail: patient?.address?.detail || "",
    comuna_id: patient?.address?.comuna_id || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (data.id) {
      post(route("pacientes.update", data.id), {
        onSuccess: () => {
          setOpenModalPatient(false);
          reset();
        },
        onError: (errors) => {
          console.log("Errors: ", errors);
        },
      });
    } else {
      post(route("pacientes.store"), {
        onSuccess: () => {
          reset();
          setOpenModalPatient(false);
        },
        onError: (errors) => {
          console.log("Errors: ", errors);
        },
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
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-3 gap-4 px-4 pt-2">
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
            onChange={(e) => handleChange(e)}
            required
            className="w-full"
          />
          <InputError message={errors?.name} className="mt-2" />
        </div>
        <div>
          <InputLabel
            htmlFor="last_name"
            value="Apellido"
            className="ml-2 text-primary"
          />
          <TextInput
            type="text"
            id="last_name"
            name="last_name"
            value={data?.last_name}
            onChange={(e) => handleChange(e)}
            required
            className="w-full"
          />
          <InputError message={errors?.last_name} className="mt-2" />
        </div>

        <div>
          <InputLabel
            htmlFor="email"
            value="Email"
            className="ml-2 text-primary"
          />
          <TextInput
            type="text"
            id="email"
            name="email"
            value={data?.email}
            onChange={(e) => handleChange(e)}
            required
            className="w-full"
          />
          <InputError message={errors?.email} className="mt-2" />
        </div>
        <div>
          <InputLabel
            htmlFor="phone"
            value="Teléfono"
            className="ml-2 text-primary"
          />
          <ChilePhoneInput
            initialValue={data?.phone}
            onChange={(phone) => setData("phone", phone)}
          />
          <InputError message={errors?.phone} className="mt-2" />
        </div>
        <div>
          <InputLabel htmlFor="rut" value="Rut" className="ml-2 text-primary" />
          <RutInput
            initialValue={data?.rut}
            onChange={(rut) => setData("rut", rut)}
            setRutError={(error) => (errors.rut = error)}
          />
          <InputError message={errors?.rut} className="mt-2" />
        </div>

        <div>
          <InputLabel
            htmlFor="fecha"
            value="Fecha"
            className="ml-2 text-primary"
          />
          <TextInput
            type="date"
            id="birth"
            name="birth"
            value={data?.birth}
            onChange={(e) => handleChange(e)}
            required
            className="w-full"
          />
          <InputError message={errors?.birth} className="mt-2" />
        </div>
      </div>
      <hr className="my-4" />
      {/* Dirección */}
      <div className="grid grid-cols-1 gap-4 px-4 pt-2">
        <div>
          <InputLabel
            htmlFor="comuna_id"
            value="Comuna"
            className="ml-2 text-primary"
          />
          <select
            id="comuna_id"
            value={data?.comuna_id}
            onChange={(e) => setData("comuna_id", e.target.value)}
            className="rounded-md w-full border-gray-100 shadow-sm focus:border-primary/20 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-primary dark:focus:ring-primary/20 border-[0.5px] "
            required
          >
            {!data?.comuna_id && <option value="">-- Comuna --</option>}
            {communes.map((comuna) => (
              <option key={comuna.id} value={comuna.id}>
                {comuna.name}
              </option>
            ))}
          </select>
          <InputError message={errors.comuna_id} className="mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 px-4 pt-2">
        <div>
          <InputLabel
            htmlFor="street"
            value="Calle"
            className="ml-2 text-primary"
          />
          <TextInput
            type="text"
            id="street"
            name="street"
            value={data?.street}
            onChange={(e) => handleChange(e)}
            className="w-full"
          />
          <InputError message={errors?.street} className="mt-2" />
        </div>

        <div>
          <InputLabel
            htmlFor="number"
            value="Numeración"
            className="ml-2 text-primary"
          />
          <TextInputNumber
            type="number"
            id="number"
            name="number"
            value={data?.number}
            onChange={(e) => handleChange(e)}
            className="w-full"
          />
          <InputError message={errors?.number} className="mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 px-4 pt-2">
        <div>
          <InputLabel
            htmlFor="address"
            value="Dirección"
            className="ml-2 text-primary"
          />
          <TextInput
            type="text"
            id="address"
            name="address"
            value={data?.address}
            onChange={(e) => handleChange(e)}
            className="w-full"
          />
          <InputError message={errors?.address} className="mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 px-4 pt-2">
        <div>
          <InputLabel
            htmlFor="detail"
            value="Detalles de la Dirección"
            className="ml-2 text-primary"
          />
          <textarea
            id="detail"
            name="detail"
            value={data?.detail}
            onChange={(e) => setData("detail", e.target.value)}
            rows="4"
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Ingrese detalles de la dirección..."
          ></textarea>
          <InputError message={errors?.detail} className="mt-2" />
        </div>
      </div>
      <hr className="mt-4" />
      <div className="flex justify-end gap-3 px-4 my-4">
        <SecondaryButton
          type="button"
          variant="outline"
          onClick={() => (reset(), setOpenModalPatient(false))}
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

export default ModalCreateEditPatient;
