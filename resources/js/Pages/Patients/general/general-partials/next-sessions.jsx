import React from "react";
import { ArrowRightIcon, Calendar, Edit, Timer } from "lucide-react";
import { estadoTexto } from "@/helpers/status";

export default function NextSessions({ patient }) {
  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <h2 className="flex items-center justify-between gap-2 mb-4 text-xl font-bold text-gray-900">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          Próximas Sesiones
        </div>

        <div className="hover:cursor-pointer">
          <ArrowRightIcon className="w-5 h-5 text-gray-300 transition-colors hover:text-gray-400" />
        </div>
      </h2>
      <div className="space-y-3">
        {patient?.appointments?.map((apt) => (
          <div
            key={apt.id}
            className="p-3 border-l-4 border-teal-500 rounded-lg bg-teal-50"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">
                  Sesión #{apt.sessionNumber}
                </p>
                <p className="text-sm text-gray-600">{apt.kinesiologist}</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                {estadoTexto(apt.status)}
              </span>
            </div>
            <p className="flex items-center gap-1 text-sm text-gray-600">
              <Calendar className="w-3 h-3" />
              {new Date(apt.date).toLocaleDateString("es-CL")} - {apt.time}
            </p>
            <p className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <Timer className="w-3 h-3" />
              {apt.duration} minutos
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
