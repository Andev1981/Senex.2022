import { User, Phone, Mail, Calendar } from "lucide-react";
import { t } from "@/constants/translations";

export default function PatientData({ patient }) {
  return (
    <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      
      <h2 className="flex items-center gap-3 mb-8 text-lg font-black text-gray-900 tracking-tight uppercase relative z-10">
        <div className="p-2 bg-brand-secondary/10 rounded-xl text-brand-primary">
            <User className="w-5 h-5" />
        </div>
        Perfil del Paciente
      </h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 relative z-10">
        <div className="space-y-1">
          <p className="enterprise-label opacity-60 ml-1">Correo Electrónico</p>
          <p className="flex items-center gap-3 font-bold text-gray-700 bg-gray-50/50 p-3 rounded-xl border border-gray-50">
            <Mail className="w-4 h-4 text-brand-primary" />
            {patient.email || 'No registrado'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="enterprise-label opacity-60 ml-1">Contacto Telefónico</p>
          <p className="flex items-center gap-3 font-bold text-gray-700 bg-gray-50/50 p-3 rounded-xl border border-gray-50">
            <Phone className="w-4 h-4 text-brand-primary" />
            {patient.phone || 'No registrado'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="enterprise-label opacity-60 ml-1">Fecha de Nacimiento</p>
          <p className="flex items-center gap-3 font-bold text-gray-700 bg-gray-50/50 p-3 rounded-xl border border-gray-50">
            <Calendar className="w-4 h-4 text-brand-primary" />
            {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString("es-CL", { day: '2-digit', month: 'long', year: 'numeric' }) : 'No registrada'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="enterprise-label opacity-60 ml-1">Vínculo Civil</p>
          <p className="flex items-center gap-3 font-bold text-gray-700 bg-gray-50/50 p-3 rounded-xl border border-gray-50">
            <div className="w-4 h-4 rounded-full bg-brand-secondary/30"></div>
            {t("maritalStatus", patient.marital_status) || 'No especificado'}
          </p>
        </div>
        <div className="space-y-1 md:col-span-2">
          <p className="enterprise-label opacity-60 ml-1">Ocupación / Profesión</p>
          <p className="flex items-center gap-3 font-bold text-gray-700 bg-gray-50/50 p-3 rounded-xl border border-gray-50">
            <div className="w-4 h-4 rounded-full bg-brand-primary/20"></div>
            {patient.occupation || 'No especificada'}
          </p>
        </div>
      </div>
    </div>
  );
}
