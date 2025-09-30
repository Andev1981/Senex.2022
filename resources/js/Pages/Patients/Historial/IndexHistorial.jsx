import React from "react";
import { Activity, Plus, Clipboard } from "lucide-react";

export default function IndexHistorial({ patient }) {
  return (
    <div className="space-y-4">
      <div className="p-6 bg-white shadow-lg rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Activity className="w-6 h-6 text-teal-600" />
            Historial Kinesiológico
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700">
            <Plus className="w-4 h-4" />
            Nueva Evaluación
          </button>
        </div>

        <div className="space-y-4">
          {patient.medicalHistory.map((record) => (
            <div
              key={record.id}
              className="p-6 transition-shadow border-l-4 border-teal-500 bg-gradient-to-r from-teal-50 to-transparent rounded-r-xl hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg">
                    <Clipboard className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 mb-1 text-xs text-white bg-teal-600 rounded-full">
                      {record.type}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">
                      {record.diagnosis}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Atendido por: {record.kinesiologist}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {new Date(record.date).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  {record.painLevel && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-600">Dolor: </span>
                      <span
                        className={`font-bold ${
                          record.painLevel >= 7
                            ? "text-red-600"
                            : record.painLevel >= 4
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {record.painLevel}/10
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm font-semibold text-gray-700">
                    Evaluación
                  </p>
                  <p className="text-sm text-gray-600">{record.evaluation}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold text-gray-700">
                    Tratamiento
                  </p>
                  <p className="text-sm text-gray-600">{record.treatment}</p>
                </div>
              </div>

              {record.notes && (
                <div className="p-3 mb-3 bg-white rounded-lg">
                  <p className="mb-1 text-sm font-semibold text-gray-700">
                    Notas Clínicas
                  </p>
                  <p className="text-sm text-gray-600">{record.notes}</p>
                </div>
              )}

              {record.recommendedSessions > 0 && (
                <div className="inline-block px-3 py-1 text-sm font-medium text-teal-700 bg-teal-100 rounded-full">
                  {record.recommendedSessions} sesiones recomendadas
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
