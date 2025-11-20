import { useMemo, useState } from "react";
import { AlertCircle, Edit } from "lucide-react";
import ResourceFormModal from "@/Components/ResourceFormModal";

export default function EmergencyContact({ patient }) {
  const [openContactModal, setOpenContactModal] = useState(false);
  const mainContact = patient?.contacts?.find((c) => c?.is_primary == true);

  const contactSchema = useMemo(
    () => [
      { name: "name", label: "Nombre", type: "text", required: true },
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "persona@correo.cl",
        required: true,
      },
      {
        name: "phone",
        label: "Teléfono",
        type: "tel",
        placeholder: "+56 9 1234 5678",
        help: "Ej: +56 9 1234 5678",
      },
      {
        name: "relationship",
        label: "Parentesco",
        type: "select",
        options: [
          { value: "madre", label: "Madre" },
          { value: "padre", label: "Padre" },
          { value: "hijo", label: "Hijo" },
          { value: "hija", label: "Hija" },
          { value: "hermano", label: "Hermano" },
          { value: "hermana", label: "Hermana" },
          { value: "abuelo", label: "Abuelo" },
          { value: "abuela", label: "Abuela" },
          { value: "nieto", label: "Nieto" },
          { value: "nieta", label: "Nieta" },
          { value: "tio", label: "Tío" },
          { value: "tia", label: "Tía" },
          { value: "sobrino", label: "Sobrino" },
          { value: "sobrina", label: "Sobrina" },
          { value: "primo", label: "Primo" },
          { value: "prima", label: "Prima" },
          { value: "conyuge", label: "Cónyuge" },
          { value: "pareja", label: "Pareja / Conviviente" },
          { value: "cuñado", label: "Cuñado" },
          { value: "cuñada", label: "Cuñada" },
          { value: "suegro", label: "Suegro" },
          { value: "suegra", label: "Suegra" },
          { value: "yerno", label: "Yerno" },
          { value: "nuera", label: "Nuera" },
          { value: "tutor", label: "Tutor / Apoderado" },
          { value: "amigo", label: "Amigo" },
          { value: "amiga", label: "Amiga" },
          { value: "vecino", label: "Vecino" },
          { value: "vecina", label: "Vecina" },
          { value: "cuidador", label: "Cuidador" },
          { value: "cuidadora", label: "Cuidadora" },
          { value: "otro", label: "Otro" },
        ],
      },
      {
        name: "type",
        label: "Tipo de Contacto",
        type: "select",
        options: [
          { value: "emergency", label: "Emergencia" },
          { value: "guardian", label: "Apoderado" },
          { value: "other", label: "Otro" },
        ],
      },
      {
        type: "hidden",
        name: "is_active",
        label: "",
        placeholder: "Contacto principal",
      },
      {
        type: "hidden",
        name: "patient_id",
      },
    ],
    [patient, mainContact]
  );

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <h2 className="flex items-center justify-between gap-2 mb-4 text-xl font-bold text-gray-900">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          Contacto de Emergencia
        </div>

        <div className="hover:cursor-pointer">
          <Edit
            className="w-5 h-5 text-gray-300 transition-colors hover:text-gray-400"
            onClick={() => setOpenContactModal(true)}
          />
        </div>
      </h2>
      <div className="p-4 border-l-4 border-red-500 rounded-lg bg-red-50">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-600">Nombre</p>
            <p className="font-semibold text-gray-900">{mainContact?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Relación</p>
            <p className="font-semibold text-gray-900 first-letter:uppercase">
              {mainContact?.relationship}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Teléfono</p>
            <p className="font-semibold text-gray-900">{mainContact?.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold text-gray-900">{mainContact?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tipo</p>
            <p className="font-semibold text-gray-900">{mainContact?.type}</p>
          </div>
        </div>
      </div>
      {/* Modal Contacto */}
      <ResourceFormModal
        open={openContactModal}
        onClose={() => setOpenContactModal(false)}
        title="Contacto Paciente"
        description={
          mainContact?.id
            ? "Editar contacto de emergencia"
            : "Crear contacto de emergencia"
        }
        submitLabel={mainContact?.id ? "Actualizar" : "Crear"}
        schema={contactSchema}
        submitRoute={
          mainContact?.id
            ? route("patients.contacts.update", {
                patientContact: mainContact?.id,
              })
            : route("patients.contacts.store", patient.id)
        }
        method={mainContact?.id ? "patch" : "post"}
        initialValues={{
          patient_id: patient?.id ?? null,
          name: mainContact?.name ?? null,
          email: mainContact?.email ?? null,
          phone: mainContact?.phone ?? null,
          relationship: mainContact?.relationship ?? null,
          type: mainContact?.type ?? null,
          is_active: mainContact?.is_active ?? true,
        }}
        afterSubmitReloadOnly={["patient", "mainContact"]}
        columns={3}
        maxWidth={"3xl"}
        key={`cont-${mainContact?.id ?? "new"}`}
      />
    </div>
  );
}
