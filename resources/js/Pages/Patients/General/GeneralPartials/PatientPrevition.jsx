import React from "react";
import { User, Phone, Mail, Calendar, MapPin, Map } from "lucide-react";
import { useForm } from "@inertiajs/react";

export default function PatientPrevition({ patient }) {
  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <h2 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900">
        <MapPin className="w-5 h-5 text-teal-600" />
        Dirección
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="mb-1 text-sm text-gray-600">Dirección</p>
          <p className="flex items-center gap-2 font-semibold text-gray-900">
            <MapPin className="w-4 h-4 text-gray-400" />
            <p className="font-semibold text-gray-900">
              {patient?.insurance?.name}
            </p>
          </p>
        </div>
        <div>
          <p className="mb-1 text-sm text-gray-600">Previsión</p>
        </div>
      </div>
    </div>
  );
}
