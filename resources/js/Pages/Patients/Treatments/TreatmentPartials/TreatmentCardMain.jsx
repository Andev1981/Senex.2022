import React from "react";
import {
  CheckCircle,
  Edit,
  Target,
  TrendingUp,
  Award,
  Activity,
  File,
  Repeat,
} from "lucide-react";

const STATUS_LABEL = [];

export default function TreatmentCardMain({ treatment, handleTreatmentModal }) {
  return (
    <div key={treatment.id} className="p-4 bg-white shadow-lg rounded-xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {treatment.name}
            </h2>
            <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
              {treatment.status}
            </span>
          </div>
          <p className="mb-1 text-gray-600">{treatment.diagnosis}</p>
          <p className="text-sm text-gray-500">
            {treatment?.doctor?.name + " " + treatment?.doctor?.last_name}
          </p>
        </div>
        <button
          className="text-teal-600 hover:text-teal-700"
          onClick={() => handleTreatmentModal(treatment)}
        >
          <Repeat className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-1">
        <div className="p-4 text-white bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl">
          <p className="mb-1 text-sm opacity-90">Sesiones</p>
          <p className="text-3xl font-bold">
            {treatment.completed_sessions}/
            {treatment.is_indefinite ? (
              <span style={{ fontSize: "1.2em", verticalAlign: "top" }}>∞</span>
            ) : (
              treatment.total_sessions
            )}
          </p>
          <div className="h-2 mt-2 rounded-full bg-white/20">
            <div
              className="h-2 transition-all bg-white rounded-full"
              style={{
                width: `${
                  (treatment.completed_sessions / treatment.total_sessions) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>

        <div className="p-4 text-white bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4" />
            <p className="text-sm opacity-90">Reducción Dolor</p>
          </div>
          <p className="text-3xl font-bold">
            {/* {treatment.progress.pain_reduction}% */}
            {treatment?.pain_reduction}%
          </p>
        </div>

        <div className="p-4 text-white bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4" />
            <p className="text-sm opacity-90">Movilidad</p>
          </div>
          <p className="text-3xl font-bold">
            {treatment?.mobility_improvement}%
          </p>
        </div>

        <div className="p-4 text-white bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4" />
            <p className="text-sm opacity-90">Fuerza</p>
          </div>
          <p className="text-3xl font-bold">{treatment.strength_gain}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-2 mb-6 lg:grid-cols-1">
        <div>
          <h3 className="flex items-center gap-2 mb-3 font-bold text-gray-900">
            <File className="w-5 h-5 text-teal-600" />
            Información General
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Inicio:</span>
              <span className="font-semibold">
                {new Date(treatment.start_date).toLocaleDateString("es-CL")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Frecuencia:</span>
              <span className="font-semibold">
                {treatment?.frequency
                  ? `${treatment.frequency} veces / ${treatment?.frequency_time} `
                  : "-"}
              </span>
            </div>
            {/* <div className="flex justify-between">
              <span className="text-gray-600">Fase Actual:</span>
              <span className="font-semibold text-teal-600">
                {treatment.current_phase}
              </span>
            </div> */}
            {treatment.next_appointment && (
              <div className="flex justify-between">
                <span className="text-gray-600">Próxima Sesión:</span>
                <span className="font-semibold text-blue-600">
                  {new Date(treatment.next_appointment).toLocaleDateString(
                    "es-CL"
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
        <div>
          <h3 className="flex items-center gap-2 mb-3 font-bold text-gray-900">
            <Target className="w-5 h-5 text-teal-600" />
            Objetivos
          </h3>
          <div className="space-y-2">
            {treatment?.objectives?.length === 0 && (
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Sin objetivos definidos</span>
              </div>
            )}
            {treatment?.objectives?.map((obj, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{obj}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

{
  /* <div>
                      <h3 className="flex items-center gap-2 mb-3 font-bold text-gray-900">
                        <Repeat className="w-5 h-5 text-teal-600" />
                        Ejercicios Asignados
                      </h3>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {treatment.exercises.map((exercise, idx) => (
                          <div
                            key={idx}
                            className="p-3 border border-teal-200 rounded-lg bg-teal-50"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {exercise.name}
                              </h4>
                              {exercise.video && (
                                <PlayCircle className="w-4 h-4 text-teal-600" />
                              )}
                            </div>
                            <div className="flex gap-4 text-xs text-gray-600">
                              <span className="font-medium">{exercise.sets}</span>
                              <span>•</span>
                              <span>{exercise.frequency}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div> */
}
