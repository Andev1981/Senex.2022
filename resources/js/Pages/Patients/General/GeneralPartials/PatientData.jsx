import { User, Phone, Mail, Calendar } from "lucide-react";
import { t } from "@/utils/translations";

export default function PatientData({ patient }) {
  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <h2 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900">
        <User className="w-5 h-5 text-teal-600" />
        Datos Personales
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="mb-1 text-sm text-gray-600">Email</p>
          <p className="flex items-center gap-2 font-semibold text-gray-900">
            <Mail className="w-4 h-4 text-gray-400" />
            {patient.email}
          </p>
        </div>
        <div>
          <p className="mb-1 text-sm text-gray-600">Teléfono</p>
          <p className="flex items-center gap-2 font-semibold text-gray-900">
            <Phone className="w-4 h-4 text-gray-400" />
            {patient.phone}
          </p>
        </div>
        <div>
          <p className="mb-1 text-sm text-gray-600">Fecha de Nacimiento</p>
          <p className="flex items-center gap-2 font-semibold text-gray-900">
            <Calendar className="w-4 h-4 text-gray-400" />
            {new Date(patient.birth_date).toLocaleDateString("es-CL")}
          </p>
        </div>
        <div>
          <p className="mb-1 text-sm text-gray-600">Estado Civil</p>
          <p className="font-semibold text-gray-900">
            {t("maritalStatus", patient.marital_status)}
          </p>
        </div>
        <div>
          <p className="mb-1 text-sm text-gray-600">Ocupación</p>
          <p className="font-semibold text-gray-900">{patient.occupation}</p>
        </div>
      </div>
    </div>
  );
}
