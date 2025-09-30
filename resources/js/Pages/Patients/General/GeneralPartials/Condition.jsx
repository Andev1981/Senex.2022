import React from "react";
import { Activity } from "lucide-react";

export default function Condition({ patient }) {
  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <h2 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900">
        <Activity className="w-5 h-5 text-teal-600" />
        Condición Física
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="p-3 rounded-lg bg-teal-50">
          <p className="mb-1 text-sm text-gray-600">Altura</p>
          <p className="text-xl font-bold text-teal-600">
            {patient.physicalCondition.height} cm
          </p>
        </div>
        <div className="p-3 rounded-lg bg-teal-50">
          <p className="mb-1 text-sm text-gray-600">Peso</p>
          <p className="text-xl font-bold text-teal-600">
            {patient.physicalCondition.weight} kg
          </p>
        </div>
        <div className="p-3 rounded-lg bg-teal-50">
          <p className="mb-1 text-sm text-gray-600">IMC</p>
          <p className="text-xl font-bold text-teal-600">
            {patient.physicalCondition.bmi}
          </p>
        </div>
        <div>
          <p className="mb-1 text-sm text-gray-600">Lado Dominante</p>
          <p className="font-semibold text-gray-900">
            {patient.physicalCondition.dominantSide}
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="mb-1 text-sm text-gray-600">Nivel de Actividad</p>
          <p className="font-semibold text-gray-900">
            {patient.physicalCondition.activityLevel}
          </p>
        </div>
        <div className="md:col-span-3">
          <p className="mb-1 text-sm text-gray-600">Práctica Deportiva</p>
          <p className="font-semibold text-gray-900">
            {patient.physicalCondition.sportsPractice}
          </p>
        </div>
      </div>
    </div>
  );
}
