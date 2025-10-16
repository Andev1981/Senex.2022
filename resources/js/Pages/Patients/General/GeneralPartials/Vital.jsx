import React, { useMemo, useState } from "react";
import { Activity, Edit, TypeIcon } from "lucide-react";
import ResourceFormModal from "@/Components/ResourceFormModal";

export default function Vital({ patient }) {
  const [openVitalModal, setOpenVitalModal] = useState(false);
  const vitalSchema = useMemo(
    () => [
      {
        name: "height_cm",
        label: "ALtura",
        type: "number",
        required: true,
        placeholder: "170,0",
      },
      {
        name: "weight_kg",
        label: "Peso",
        type: "number",
        placeholder: "70,0",
        required: true,
      },
      {
        name: "bp_diastolic",
        label: "Presión Diastólica",
        type: "number",
        placeholder: "",
      },
      {
        name: "bp_systolic",
        label: "Presión Sistólica",
        type: "number",
        placeholder: "",
      },
      {
        name: "resp_rate",
        label: "Respiración",
        type: "number",
        placeholder: "16,0",
      },
      {
        name: "heart_rate",
        label: "Latidos",
        type: "number",
        placeholder: "16,0",
      },
      {
        name: "spo2",
        label: "Pso2",
        type: "number",
        placeholder: "98,0",
      },
      {
        name: "temperature_c",
        label: "Temperatura",
        type: "number",
        placeholder: "36,7",
      },
      {
        name: "blood_type",
        label: "Tipo de Sangre",
        type: "select",
        options: [
          { value: "A+", label: "A+" },
          { value: "A-", label: "A-" },
          { value: "B+", label: "B+" },
          { value: "B-", label: "B-" },
          { value: "AB+", label: "AB+" },
          { value: "AB-", label: "AB-" },
          { value: "O+", label: "O+" },
          { value: "O-", label: "O-" },
        ],
      },
      {
        type: "hidden",
        name: "patient_id",
      },
    ],
    [patient]
  );

  console.log(patient?.latest_vital);

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <h2 className="flex items-center justify-between gap-2 mb-4 text-xl font-bold text-gray-900">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" />
          Datos Vitales
        </div>

        <div className="hover:cursor-pointer">
          <Edit
            className="w-5 h-5 text-gray-300 transition-colors hover:text-gray-400"
            onClick={() => setOpenVitalModal(true)}
          />
        </div>
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="p-3 rounded-lg bg-teal-50">
          <p className="mb-1 text-sm text-gray-600">Altura</p>
          <p className="text-base font-bold text-teal-600">
            {patient?.latest_vital?.height_cm} cm
          </p>
        </div>
        <div className="p-3 rounded-lg bg-teal-50">
          <p className="mb-1 text-sm text-gray-600">Peso</p>
          <p className="text-base font-bold text-teal-600">
            {patient?.latest_vital?.weight_kg} kg
          </p>
        </div>
        <div className="p-3 rounded-lg bg-teal-50">
          <p className="mb-1 text-sm text-gray-600">IMC</p>
          <p className="text-base font-bold text-teal-600">
            {patient?.latest_vital?.bmi}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 py-3">
        <div className="p-2 rounded-lg bg-blue-50">
          <p className="mb-1 text-sm text-gray-600">Presión Diastólica</p>
          <p className="text-xl font-bold text-blue-600">
            {patient?.latest_vital?.bp_diastolic}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-blue-50">
          <p className="mb-1 text-sm text-gray-600">Presión Sistólica</p>
          <p className="text-xl font-bold text-blue-600">
            {patient?.latest_vital?.bp_systolic}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-red-50">
          <p className="mb-1 text-sm text-gray-600">Tipo de sangre</p>
          <p className="text-xl font-bold text-blue-600">
            {patient?.latest_vital?.blood_type}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-green-50">
          <p className="mb-1 text-sm text-gray-600">Respiración</p>
          <p className="font-semibold text-gray-900">
            {patient?.latest_vital?.resp_rate}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-blue-50">
          <p className="mb-1 text-sm text-gray-600">Latidos</p>
          <p className="font-semibold text-gray-900">
            {patient?.latest_vital?.heart_rate}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-blue-50">
          <p className="mb-1 text-sm text-gray-600">
            Spo2{" "}
            {/*  <span className="font-xs text-gray-500 italic">
              (Saturación perifierica de oxigeno)
            </span> */}
          </p>
          <p className="font-semibold text-gray-900">
            {patient?.latest_vital?.spo2}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-blue-50">
          <p className="mb-1 text-sm text-gray-600">Temperatura</p>
          <p className="font-semibold text-gray-900">
            {patient?.latest_vital?.temperature_c}°
          </p>
        </div>
      </div>

      {/* Modal Contacto */}
      <ResourceFormModal
        open={openVitalModal}
        onClose={() => setOpenVitalModal(false)}
        title="Datos Vitales Paciente"
        description={
          patient?.latest_vital?.id
            ? "Editar datos vitales"
            : "Crear datos vitales"
        }
        schema={vitalSchema}
        submitRoute={
          patient?.latest_vital?.id
            ? route("patients.vitals.update", patient?.latest_vital?.id)
            : route("patients.vitals.store")
        }
        method={patient?.latest_vital?.id ? "patch" : "post"}
        initialValues={{
          patient_id: patient?.id ?? null,
          height_cm: patient?.latest_vital?.height_cm ?? null,
          weight_kg: patient?.latest_vital?.weight_kg ?? null,
          bp_diastolic: patient?.latest_vital?.bp_diastolic ?? null,
          bp_systolic: patient?.latest_vital?.bp_systolic ?? null,
          resp_rate: patient?.latest_vital?.resp_rate ?? null,
          heart_rate: patient?.latest_vital?.heart_rate ?? null,
          spo2: patient?.latest_vital?.spo2 ?? true,
          temperature_c: patient?.latest_vital?.temperature_c ?? true,
          blood_type: patient?.latest_vital?.blood_type ?? true,
        }}
        afterSubmitReloadOnly={["patient"]}
        columns={3}
        maxWidth={"3xl"}
        key={`condition-${patient?.latest_vital?.id ?? "new"}`}
      />
    </div>
  );
}
