import React from "react";
import { AlertCircle } from "lucide-react";

export default function EmergencyContact({ patient }) {
  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <h2 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900">
        <AlertCircle className="w-5 h-5 text-red-600" />
        Contacto de Emergencia
      </h2>
      <div className="p-4 border-l-4 border-red-500 rounded-lg bg-red-50">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-600">Nombre</p>
            <p className="font-semibold text-gray-900">
              {patient.emergencyContact.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Relación</p>
            <p className="font-semibold text-gray-900">
              {patient.emergencyContact.relationship}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Teléfono</p>
            <p className="font-semibold text-gray-900">
              {patient.emergencyContact.phone}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold text-gray-900">
              {patient.emergencyContact.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
