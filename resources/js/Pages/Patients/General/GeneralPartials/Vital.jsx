import React, { useMemo, useState } from "react";
import { Activity, Edit, TypeIcon, CheckCircle2 } from "lucide-react";
import ResourceFormModal from "@/Components/ResourceFormModal";

export default function Vital({ patient, vital }) {
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
    [vital]
  );

  return (
    <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-brand-primary/5 blur-2xl"></div>

      <h2 className="relative z-10 flex items-center justify-between gap-2 mb-8 text-lg font-black tracking-tight text-gray-900 uppercase">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-secondary/10 rounded-xl text-brand-primary">
            <Activity className="w-5 h-5" />
          </div>
          Biometría & Vitales
        </div>

        <button
          onClick={() => setOpenVitalModal(true)}
          className="p-2.5 text-gray-300 hover:text-brand-primary hover:bg-brand-secondary/10 rounded-xl transition-all active:scale-90"
        >
          <Edit className="w-5 h-5" />
        </button>
      </h2>

      <div className="relative z-10 grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 text-center transition-all border border-gray-100 rounded-2xl bg-gray-50/50 group hover:bg-white hover:shadow-md">
          <p className="enterprise-label !text-[8px] opacity-60">Altura</p>
          <p className="font-mono text-sm font-black tracking-tighter text-brand-primary">
            {vital?.height_cm || "--"}{" "}
            <span className="text-[10px] opacity-40">CM</span>
          </p>
        </div>
        <div className="p-4 text-center transition-all border border-gray-100 rounded-2xl bg-gray-50/50 group hover:bg-white hover:shadow-md">
          <p className="enterprise-label !text-[8px] opacity-60">Peso</p>
          <p className="font-mono text-sm font-black tracking-tighter text-brand-primary">
            {vital?.weight_kg || "--"}{" "}
            <span className="text-[10px] opacity-40">KG</span>
          </p>
        </div>
        <div className="p-4 text-center text-white transition-all shadow-lg rounded-2xl bg-brand-primary shadow-brand-primary/20 group hover:scale-105">
          <p className="text-[8px] font-black uppercase tracking-widest opacity-60">
            IMC
          </p>
          <p className="font-mono text-sm font-black tracking-tighter">
            {vital?.bmi || "--"}
          </p>
        </div>
      </div>

      <div className="relative z-10 space-y-3">
        <div className="p-5 rounded-[1.5rem] bg-blue-50/50 border border-blue-100 flex items-center justify-between">
          <div>
            <p className="enterprise-label !text-[8px] text-blue-600 !mb-0">
              Presión Arterial
            </p>
            <p className="font-mono text-xl font-black tracking-tighter text-blue-700">
              {vital?.bp_systolic || "--"} / {vital?.bp_diastolic || "--"}
            </p>
          </div>
          <div className="p-2 text-blue-500 bg-white shadow-sm rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
            <div>
              <p className="enterprise-label !text-[8px] !mb-0">Latidos</p>
              <p className="font-mono font-black text-gray-900">
                {vital?.heart_rate || "--"}
              </p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
            <div>
              <p className="enterprise-label !text-[8px] !mb-0">Temp.</p>
              <p className="font-mono font-black text-gray-900">
                {vital?.temperature_c || "--"}°
              </p>
            </div>
            <div className="font-black text-orange-400">C°</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border border-green-100 rounded-2xl bg-green-50/50">
          <div className="flex items-center gap-4">
            <div className="p-2 text-green-600 bg-white rounded-lg shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="enterprise-label !text-[8px] text-green-700 !mb-0">
                Saturación (SpO2)
              </p>
              <p className="font-mono font-black text-green-800">
                {vital?.spo2 || "--"}%
              </p>
            </div>
          </div>
        </div>

                <div className="p-4 rounded-2xl bg-brand-secondary text-white flex items-center justify-between shadow-lg shadow-brand-secondary/20">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/20 rounded-lg text-white">
                            <div className="w-4 h-4 rounded-full border-2 border-white/60 flex items-center justify-center font-black text-[8px]">Rh</div>
                        </div>
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/80 mb-0">Grupo Sanguíneo</p>
                            <p className="font-black text-white text-base tracking-widest">{vital?.blood_type || 'PENDIENTE'}</p>
                        </div>
                    </div>
                </div>      </div>

      {/* Modal Contacto */}
      <ResourceFormModal
        open={openVitalModal}
        onClose={() => setOpenVitalModal(false)}
        title="Datos Vitales Paciente"
        description={vital?.id ? "Editar datos vitales" : "Crear datos vitales"}
        schema={vitalSchema}
        submitRoute={
          vital?.id
            ? route("patients.vitals.update", vital?.id)
            : route("patients.vitals.store")
        }
        submitLabel={vital?.id ? "Actualizar" : "Crear"}
        method={vital?.id ? "patch" : "post"}
        initialValues={{
          patient_id: patient?.id ?? null,
          height_cm: vital?.height_cm ?? null,
          weight_kg: vital?.weight_kg ?? null,
          bp_diastolic: vital?.bp_diastolic ?? null,
          bp_systolic: vital?.bp_systolic ?? null,
          resp_rate: vital?.resp_rate ?? null,
          heart_rate: vital?.heart_rate ?? null,
          spo2: vital?.spo2 ?? true,
          temperature_c: vital?.temperature_c ?? true,
          blood_type: vital?.blood_type ?? true,
        }}
        afterSubmitReloadOnly={["patient"]}
        columns={3}
        maxWidth={"3xl"}
        key={`condition-${vital?.id ?? "new"}`}
      />
    </div>
  );
}
