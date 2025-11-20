import React, { useMemo, useState } from "react";
import { User, Phone, Mail, Calendar, MapPin, Map, Edit } from "lucide-react";
import { useForm } from "@inertiajs/react";
import ResourceFormModal from "@/Components/ResourceFormModal";

export default function PatientAddress({
  patient,
  communes,
  regions,
  provinces,
  address,
}) {
  const [openAddressModal, setOpenAddressModal] = useState(false);

  const addressSchema = useMemo(
    () => [
      {
        name: "region_id",
        label: "Región",
        type: "select",
        options: (form) => regions.map((d) => ({ value: d.id, label: d.name })),
        parse: (raw) => (raw ? Number(raw) : null),
        placeholder: "Seleccione Región",
      },
      {
        name: "province_id",
        label: "Provincia",
        type: "select",
        dependsOn: ["region_id"],
        options: (form) =>
          provinces
            .filter((p) => p.region_id === form.region_id)
            .map((p) => ({ value: p.id, label: p.name })),
        disabled: (form) => !form.region_id,
        parse: (raw) => (raw ? Number(raw) : null),
        placeholder: "Seleccione Provincia",
      },
      {
        name: "commune_id",
        label: "Comuna",
        type: "select",
        dependsOn: ["province_id"],
        options: (form) =>
          communes
            .filter((c) => c.province_id === form.province_id)
            .map((c) => ({ value: c.id, label: c.name })),
        disabled: (form) => !form.province_id,
        parse: (raw) => (raw ? Number(raw) : null),
        placeholder: "Seleccione Comuna",
      },
      {
        name: "street",
        label: "Calle",
        type: "text",
        required: true,
        colSpan: 2,
      },
      { name: "number", label: "Número", type: "number", required: true },
      {
        name: "details",
        label: "Detalles",
        type: "textarea",
        rows: 3,
        colSpan: 3,
      },
      {
        name: "patient_id",
        label: "ID del Paciente",
        type: "hidden",
      },
    ],
    [regions, provinces, communes]
  );

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <h2 className="flex items-center justify-between mb-4 text-xl font-bold text-gray-900">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          Dirección
        </div>
        <div
          className="hover:cursor-pointer"
          onClick={() => setOpenAddressModal(true)}
        >
          <Edit className="w-5 h-5 text-gray-300 transition-colors hover:text-gray-400" />
        </div>
      </h2>
      <div className="p-4 border-l-4 border-green-500 rounded-lg bg-green-50">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="">
            <p className="mb-1 text-sm text-gray-600">Región</p>
            <p className="flex items-center gap-2 font-semibold text-gray-900">
              {address?.region?.name}
            </p>
          </div>
          <div className="">
            <p className="mb-1 text-sm text-gray-600">Provincia</p>
            <p className="flex items-center gap-2 font-semibold text-gray-900">
              {address?.province?.name}
            </p>
          </div>
          <div className="">
            <p className="mb-1 text-sm text-gray-600">Comuna</p>
            <p className="flex items-center gap-2 font-semibold text-gray-900">
              {address?.commune?.name}
            </p>
          </div>
          <div className="col-span-2">
            <p className="mb-1 text-sm text-gray-600">Calle</p>
            <p className="flex items-center gap-2 font-semibold text-gray-900">
              {address?.street}
            </p>
          </div>
          <div className="">
            <p className="mb-1 text-sm text-gray-600">Número</p>
            <p className="flex items-center gap-2 font-semibold text-gray-900">
              {address?.number}
            </p>
          </div>
          <div className="">
            <p className="mb-1 text-sm text-gray-600">Detalles</p>
            <p className="flex items-center gap-2 font-semibold text-gray-900">
              {address?.details}
            </p>
          </div>
        </div>
      </div>
      <ResourceFormModal
        open={openAddressModal}
        onClose={() => setOpenAddressModal(false)}
        title="Direccón Paciente"
        description={address ? "Edición de dirección" : "Creación de dirección"}
        submitLabel={address ? "Actualizar" : "Crear"}
        schema={addressSchema}
        submitRoute={
          address?.id
            ? route("patients.addresses.update", patient.id)
            : route("patients.addresses.store", patient.id)
        }
        method={address?.id ? "patch" : "post"}
        initialValues={{
          patient_id: address?.patient_id ?? null,
          region_id: address?.region_id ?? null,
          province_id: address?.province_id ?? null,
          commune_id: address?.commune_id ?? null,
          street: address?.street ?? "",
          number: address?.number ?? "",
          details: address?.details ?? "",
        }}
        afterSubmitReloadOnly={["address", "patient"]}
        columns={3}
        maxWidth={"3xl"}
        key={`addr-${address?.id ?? "new"}`}
      />
    </div>
  );
}
