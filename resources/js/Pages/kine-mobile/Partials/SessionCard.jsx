// resources/js/pages/KineMobile/components/SessionCard.jsx
import React from "react";
import {
  Clock,
  User,
  Phone,
  FileText,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";
import { router } from "@inertiajs/react";

const statusConfig = {
  Programada: {
    color: "bg-blue-50 border-blue-200",
    textColor: "text-blue-700",
    icon: Clock,
    badgeColor: "bg-blue-100 text-blue-700",
  },
  Completada: {
    color: "bg-green-50 border-green-200",
    textColor: "text-green-700",
    icon: CheckCircle2,
    badgeColor: "bg-green-100 text-green-700",
  },
  Cancelada: {
    color: "bg-red-50 border-red-200",
    textColor: "text-red-700",
    icon: XCircle,
    badgeColor: "bg-red-100 text-red-700",
  },
};

export default function SessionCard({
  session,
  onComplete,
  onCancel,
  showDate = false,
}) {
  const config = statusConfig[session.status] || statusConfig["Programada"];
  const StatusIcon = config.icon;

  const handleCallPatient = (e) => {
    e.stopPropagation();
    if (session.patient_phone) {
      window.location.href = `tel:${session.patient_phone}`;
    }
  };

  const handleViewDetail = () => {
    router.visit(route("kine.sessions.show", session.id));
  };

  return (
    <div
      className={`p-4 border rounded-lg ${config.color} shadow-sm transition-all hover:shadow-md cursor-pointer`}
      onClick={handleViewDetail}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-gray-600" />
            <span className="font-semibold text-gray-900">
              {session.patient_name}
            </span>
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            {showDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Date(session.date).toLocaleDateString("es-CL")}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {new Date(session.time).toLocaleDateString("es-CL")} •{" "}
                {session.duration} min
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              <span>{session.session_type}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${config.badgeColor}`}
          >
            <StatusIcon className="inline w-3 h-3 mr-1" />
            {session.status}
          </span>
          {session.patient_phone && (
            <button
              onClick={handleCallPatient}
              className="p-2 text-teal-600 transition-colors bg-white rounded-full hover:bg-teal-50"
            >
              <Phone className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Diagnóstico */}
      {session.diagnosis && session.diagnosis !== "Sin diagnóstico" && (
        <div className="p-2 mb-3 text-xs text-gray-600 bg-white rounded">
          <span className="font-semibold">Dx:</span> {session.diagnosis}
        </div>
      )}

      {/* Notas */}
      {session.notes && (
        <div className="p-2 mb-3 text-xs text-gray-600 bg-white rounded">
          <span className="font-semibold">Notas:</span> {session.notes}
        </div>
      )}

      {/* Acciones (solo para sesiones programadas) */}
      {session.status === "Programada" && onComplete && onCancel && (
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete(session);
            }}
            className="flex-1 px-3 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
          >
            ✓ Completar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel(session);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Earnings (solo si está completada) */}
      {session.status === "Completada" && session.earnings && (
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
          <span className="text-xs text-gray-600">Tu comisión</span>
          <span className="text-sm font-bold text-teal-600">
            ${session.earnings.toLocaleString("es-CL")}
          </span>
        </div>
      )}
    </div>
  );
}
