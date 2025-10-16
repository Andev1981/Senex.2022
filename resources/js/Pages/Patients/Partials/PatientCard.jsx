import { Activity, Edit, FileText, User } from "lucide-react";
import { useMemo, useState } from "react";
import ResourceFormModal from "@/Components/ResourceFormModal";

export default function PatientCard({ patient }) {
  const [openPatientModal, setOpenPatientModal] = useState(false);
  const patientSchema = useMemo(
    () => [
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "last_name", label: "Apellido", type: "text", required: true },

      {
        name: "rut",
        label: "RUT",
        type: "rut",
        help: "Sin puntos, con guion y DV. Ej: 12345678-9",
        required: true,
      },

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
        name: "birth_date",
        label: "Fecha de nacimiento",
        type: "date",
        min: "1900-01-01",
        max: "today",
      },
      {
        name: "gender",
        label: "Género",
        type: "select",
        options: [
          { value: "male", label: "Masculino" },
          { value: "female", label: "Femenino" },
          { value: "other", label: "Otro" },
          { value: "unknown", label: "No especifica" },
        ],
      },

      { name: "occupation", label: "Ocupación", type: "text" },

      {
        name: "marital_status",
        label: "Estado civil",
        type: "select",
        options: [
          { value: "", label: "—" },
          { value: "single", label: "Soltero/a" },
          { value: "married", label: "Casado/a" },
          { value: "divorced", label: "Divorciado/a" },
          { value: "widowed", label: "Viudo/a" },
          { value: "cohabiting", label: "Conviviente" },
        ],
        parse: (raw) => (raw ? raw : null),
        parseInitial: (v) => v ?? null,
      },

      {
        name: "status",
        label: "Estado",
        type: "select",
        options: [
          { value: "active", label: "Activo" },
          { value: "suspended", label: "Suspendido" },
          { value: "cancelled", label: "Cancelado" },
        ],
      },
      {
        name: "status_reason",
        label: "Motivo del estado",
        type: "textarea",
        rows: 3,
        colSpan: 2,
        visibleIf: (data) => ["suspended", "cancelled"].includes(data.status),
        help: "Se guardará en auditoría de cambios.",
      },

      { name: "notes", label: "Notas", type: "textarea", rows: 4, colSpan: 3 },
    ],
    [patient]
  );
  return (
    <div className="flex flex-col items-start justify-between w-full gap-4 md:flex-row md:items-center">
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-20 h-20 border-2 bg-white/20 backdrop-blur-sm rounded-2xl border-white/30">
          <User className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="mb-2 text-2xl font-bold">
            {patient?.name + " " + patient?.last_name}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-teal-100">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              RUT: {patient?.rut}
            </span>
            <span>•</span>
            <span>{patient?.age} años</span>
            <span>•</span>
            <span>{patient?.gender}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              {patient?.activity_level}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setOpenPatientModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm"
        >
          <Edit className="w-4 h-4" />
          Editar
        </button>
      </div>
      {/* Modal Paciente */}
      <ResourceFormModal
        open={openPatientModal}
        onClose={() => setOpenPatientModal(false)}
        title="Datos Paciente"
        description="Para editar datos principales"
        schema={patientSchema}
        submitRoute={
          patient
            ? route("patients.update", patient.id)
            : route("patients.store")
        }
        method={"patch"}
        initialValues={{
          name: patient?.name ?? "",
          last_name: patient?.last_name ?? "",
          rut: patient?.rut ?? "",
          email: patient?.email ?? "",
          phone: patient?.phone ?? "",
          birth_date: patient?.birth_date ?? "",
          gender: patient?.gender ?? "",
          occupation: patient?.occupation ?? "",
          marital_status: patient?.marital_status ?? "",
          status: patient?.status ?? "",
          status_reason: patient?.status_reason ?? "",
        }}
        afterSubmitReloadOnly={["patient"]}
        columns={3}
        maxWidth={"3xl"}
        key={`gen-${patient?.id ?? "new"}`}
      />
    </div>
  );
}
