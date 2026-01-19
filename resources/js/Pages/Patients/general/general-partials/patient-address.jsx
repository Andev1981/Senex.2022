import React, { useMemo, useState } from "react";
import { User, Phone, Mail, Calendar, MapPin, Map, Edit } from "lucide-react";
import { useForm } from "@inertiajs/react";
import ResourceFormModal from "@/components/ResourceFormModal";

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
        type: "hidden",
      },
    ],
    [regions, provinces, communes]
  );

  return (
    <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      
      <h2 className="flex items-center justify-between mb-8 text-lg font-black text-gray-900 tracking-tight uppercase relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-xl text-green-600">
            <MapPin className="w-5 h-5" />
          </div>
          Localización
        </div>
        <button
          onClick={() => setOpenAddressModal(true)}
          className="p-2.5 text-gray-300 hover:text-brand-primary hover:bg-brand-secondary/10 rounded-xl transition-all active:scale-90"
        >
          <Edit className="w-5 h-5" />
        </button>
      </h2>

      <div className="p-6 border-2 border-gray-50 rounded-3xl bg-gray-50/30 relative z-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-1">
            <p className="enterprise-label !text-[8px] opacity-60">Región</p>
            <p className="text-sm font-black text-gray-700 uppercase tracking-tight">
              {address?.region?.name || 'No especificada'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="enterprise-label !text-[8px] opacity-60">Provincia</p>
            <p className="text-sm font-black text-gray-700 uppercase tracking-tight">
              {address?.province?.name || 'No especificada'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="enterprise-label !text-[8px] opacity-60">Comuna</p>
            <p className="text-sm font-black text-gray-700 uppercase tracking-tight">
              {address?.commune?.name || 'No especificada'}
            </p>
          </div>
          <div className="col-span-2 space-y-1">
            <p className="enterprise-label !text-[8px] opacity-60">Calle / Avenida</p>
            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">
              {address?.street || 'Sin información'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="enterprise-label !text-[8px] opacity-60">N°</p>
            <p className="text-sm font-black text-brand-primary font-mono">
              #{address?.number || '---'}
            </p>
          </div>
          {address?.details && (
            <div className="col-span-3 space-y-1 pt-4 border-t border-gray-100">
                <p className="enterprise-label !text-[8px] opacity-60">Observaciones de Entrega / Acceso</p>
                <p className="text-xs font-bold text-gray-500 uppercase italic">
                {address?.details}
                </p>
            </div>
          )}
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
