// resources/js/Pages/KineMobile/PatientDetail.jsx
import React from "react";
import { Head, router } from "@inertiajs/react";
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  User,
  Activity,
  FileText,
  TrendingUp,
} from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";

export default function PatientDetail({ patient }) {
  const handleBack = () => {
    router.visit(route("kine.my-patients"));
  };

  const handleCallPatient = () => {
    if (patient.phone) {
      window.location.href = `tel:${patient.phone}`;
    }
  };

  return (
    <KineLayout>
      <Head title={patient.name} />

      <div className="min-h-screen pb-20 bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={handleBack}
                className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-gray-900">
                  {patient.name}
                </h1>
                <p className="text-sm text-gray-600">{patient.rut}</p>
              </div>
              {patient.phone && (
                <button
                  onClick={handleCallPatient}
                  className="p-3 text-white bg-teal-600 rounded-full shadow-lg hover:bg-teal-700"
                >
                  <Phone className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Información del paciente */}
        <div className="px-4 py-4 space-y-4">
          {/* Datos personales */}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h2 className="mb-3 font-semibold text-gray-900">
              Datos personales
            </h2>
            <div className="space-y-2 text-sm">
              {patient.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{patient.phone}</span>
                </div>
              )}
              {patient.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{patient.email}</span>
                </div>
              )}
              {patient.birth_date && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(patient.birth_date).toLocaleDateString("es-CL")}
                  </span>
                </div>
              )}
              {patient.gender && (
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="capitalize">{patient.gender}</span>
                </div>
              )}
            </div>

            {patient.emergency_contact && (
              <div className="pt-3 mt-3 border-t border-gray-200">
                <p className="mb-2 text-xs font-semibold text-gray-500 uppercase">
                  Contacto de emergencia
                </p>
                <p className="text-sm text-gray-900">
                  {patient.emergency_contact.name}
                </p>
                <p className="text-sm text-gray-600">
                  {patient.emergency_contact.phone}
                </p>
              </div>
            )}
          </div>

          {/* Tratamientos activos */}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h2 className="mb-3 font-semibold text-gray-900">Tratamientos</h2>
            {patient.treatments.length === 0 ? (
              <p className="text-sm text-gray-500">Sin tratamientos activos</p>
            ) : (
              <div className="space-y-3">
                {patient.treatments.map((treatment) => (
                  <div
                    key={treatment.id}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {treatment.session_type}
                        </p>
                        <p className="text-xs text-gray-600">
                          {treatment.diagnosis}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          treatment.status === "InProgress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {treatment.status}
                      </span>
                    </div>

                    {/* Progreso */}
                    {treatment.progress.total > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1 text-xs text-gray-600">
                          <span>Progreso</span>
                          <span>
                            {treatment.progress.completed}/
                            {treatment.progress.total} sesiones
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 transition-all bg-teal-500 rounded-full"
                            style={{
                              width: `${treatment.progress.percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <p className="mt-2 text-xs text-gray-500">
                      Inicio:{" "}
                      {new Date(treatment.start_date).toLocaleDateString(
                        "es-CL"
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sesiones recientes */}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h2 className="mb-3 font-semibold text-gray-900">
              Sesiones recientes
            </h2>
            {patient.recent_sessions.length === 0 ? (
              <p className="text-sm text-gray-500">Sin sesiones registradas</p>
            ) : (
              <div className="space-y-2">
                {patient.recent_sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {session.session_type}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(session.date).toLocaleDateString("es-CL")} -{" "}
                        {session.time}
                      </p>
                      {session.notes && (
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                          {session.notes}
                        </p>
                      )}
                    </div>
                    <span
                      className={`ml-2 px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                        session.status === "Completada"
                          ? "bg-green-100 text-green-700"
                          : session.status === "Programada"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </KineLayout>
  );
}
