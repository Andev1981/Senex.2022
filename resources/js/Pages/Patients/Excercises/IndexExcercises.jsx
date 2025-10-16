import { Repeat } from "lucide-react";
import React from "react";

export default function IndexExcercises({ patient }) {
  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-gray-900">
        <Repeat className="w-6 h-6 text-teal-600" /> Plan de Ejercicios
      </h2>
      {(patient.treatments || [])
        .filter((t) => t.status === "Activo")
        .map((treatment) => (
          <ExerciseBlock key={treatment.id} treatment={treatment} />
        ))}
    </div>
  );
}

function ExerciseBlock({ treatment }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-teal-200">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{treatment.name}</h3>
          <p className="text-sm text-gray-600">{treatment.currentPhase}</p>
        </div>
        <button className="flex items-center gap-2 text-teal-600 hover:text-teal-700">
          Ver Todos los Videos
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(treatment.exercises || []).map((exercise, idx) => (
          <div
            key={idx}
            className="p-4 transition-all border-2 border-gray-200 rounded-xl hover:border-teal-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="mb-1 font-bold text-gray-900">
                  {exercise.name}
                </h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 text-xs font-medium text-teal-700 bg-teal-100 rounded">
                    {exercise.sets}
                  </span>
                  <span className="text-xs text-gray-600">
                    {exercise.frequency}
                  </span>
                </div>
              </div>
              {exercise.video && (
                <button className="p-2 text-teal-600 bg-teal-100 rounded-lg hover:bg-teal-200">
                  ▶
                </button>
              )}
            </div>
            <div className="p-3 text-sm text-gray-600 rounded-lg bg-gray-50">
              <p>Instrucciones detalladas del ejercicio…</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
