import React from "react";
import { Edit, Heart } from "lucide-react";

export default function MedicalInformation({ patient }) {
  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <h2 className="flex items-center justify-between gap-2 mb-4 text-xl font-bold text-gray-900">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-600" />
          Información Médica
        </div>

        <div className="hover:cursor-pointer">
          <Edit className="w-5 h-5 text-gray-300 transition-colors hover:text-gray-400" />
        </div>
      </h2>
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-blue-50">
          <p className="mb-1 text-sm text-gray-600">Tipo de Sangre</p>
          <p className="text-xl font-bold text-blue-600">
            {patient.blood_type}
          </p>
        </div>
        <div>
          <p className="mb-1 text-sm text-gray-600">Alergias</p>
          <p className="font-semibold text-gray-900">{patient.allergies}</p>
        </div>
        <div>
          <p className="mb-1 text-sm text-gray-600">Condiciones Crónicas</p>
          <p className="font-semibold text-gray-900">
            {patient.chronic_conditions}
          </p>
        </div>
      </div>
    </div>
  );
}
