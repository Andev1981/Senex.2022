import { useMemo, useState } from "react";
import { AlertCircle, Edit } from "lucide-react";
import ResourceFormModal from "@/components/ResourceFormModal";
import { t } from "@/constants/translations";
import { RELATIONSHIP_OPTIONS } from "@/constants/relationshipOptions";

export default function EmergencyContact({ patient, contact }) {
  const [openContactModal, setOpenContactModal] = useState(false);
  const mainContact = contact ? contact : null;

  const contactSchema = useMemo(
    () => [
      { name: "contact_name", label: "Nombre", type: "text", required: true },
      {
        name: "contact_email",
        label: "Email",
        type: "email",
        placeholder: "persona@correo.cl",
        required: true,
      },
      {
        name: "contact_phone",
        label: "Teléfono",
        type: "tel",
        placeholder: "+56 9 1234 5678",
        help: "Ej: +56 9 1234 5678",
      },
      {
        name: "contact_relationship",
        label: "Parentesco",
        type: "select",
        options: RELATIONSHIP_OPTIONS,
      },
      {
        name: "patient_id",
        type: "hidden",
      },
    ],
    [patient, mainContact]
  );

  return (
    <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      
      <h2 className="flex items-center justify-between mb-8 text-lg font-black text-gray-900 tracking-tight uppercase relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-xl text-red-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          Red de Contacto
        </div>
        <button
          onClick={() => setOpenContactModal(true)}
          className="p-2.5 text-gray-300 hover:text-brand-primary hover:bg-brand-secondary/10 rounded-xl transition-all active:scale-90"
        >
          <Edit className="w-5 h-5" />
        </button>
      </h2>

      <div className="p-6 border-2 border-gray-50 rounded-3xl bg-gray-50/30 relative z-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-1">
            <p className="enterprise-label !text-[8px] opacity-60">Nombre Completo</p>
            <p className="text-sm font-black text-gray-700 uppercase tracking-tight">
                {mainContact?.name || 'No registrado'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="enterprise-label !text-[8px] opacity-60">Vínculo / Parentesco</p>
            <p className="text-sm font-black text-brand-primary uppercase tracking-widest">
              {mainContact?.relationship || '---'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="enterprise-label !text-[8px] opacity-60">Teléfono Directo</p>
            <p className="text-sm font-black text-gray-700 font-mono tracking-tighter">
                {mainContact?.phone || '---'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="enterprise-label !text-[8px] opacity-60">Email</p>
            <p className="text-sm font-bold text-gray-500 lowercase truncate">
                {mainContact?.email || '---'}
            </p>
          </div>
          <div className="col-span-2 pt-4 border-t border-gray-100">
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black bg-white border border-gray-100 text-brand-gray uppercase tracking-[0.2em] shadow-sm">
                Rol: {mainContact?.type === 'guardian' ? 'Apoderado' : 'Emergencia'}
            </span>
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
        submitRoute={route("patients.update", patient.id)}
        method="patch"
        initialValues={{
          name: patient.name,
          last_name: patient.last_name,
          rut: patient.rut,
          email: patient.email,
          birth_date: patient.birth_date,
          phone: patient.phone,
          contact_name: mainContact?.name ?? null,
          contact_email: mainContact?.email ?? null,
          contact_phone: mainContact?.phone ?? null,
          contact_relationship: mainContact?.relationship ?? null,
        }}
        afterSubmitReloadOnly={["patient"]}
        columns={3}
        maxWidth={"3xl"}
        key={`cont-${mainContact?.id ?? "new"}`}
      />
    </div>
  );
}
