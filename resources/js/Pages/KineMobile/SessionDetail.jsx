// resources/js/Pages/KineMobile/SessionDetail.jsx
import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Clock,
  FileText,
  DollarSign,
  Activity,
  CheckCircle2,
  XCircle,
  Edit3,
  Save,
  Stethoscope,
} from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";

export default function SessionDetail({ session }) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(session.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  const statusConfig = {
    Programada: {
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: Clock,
      label: "Programada",
    },
    Completada: {
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle2,
      label: "Completada",
    },
    Cancelada: {
      color: "bg-red-100 text-red-700 border-red-200",
      icon: XCircle,
      label: "Cancelada",
    },
  };

  const config = statusConfig[session.status] || statusConfig["Programada"];
  const StatusIcon = config.icon;

  const handleBack = () => {
    router.visit(route("kine.my-sessions"));
  };

  const handleCallPatient = () => {
    if (session.patient.phone) {
      window.location.href = `tel:${session.patient.phone}`;
    }
  };

  const handleCompleteSession = () => {
    if (!confirm("¿Confirmas que completaste esta sesión?")) return;

    router.post(
      route("kine.sessions.complete", session.id),
      {
        notes: notes,
        duration_actual: session.session_type.duration,
      },
      {
        onSuccess: () => {
          router.visit(route("kine.my-sessions"));
        },
      }
    );
  };

  const handleCancelSession = () => {
    const reason = prompt("Motivo de cancelación:");
    if (!reason) return;

    router.post(
      route("kine.sessions.cancel", session.id),
      {
        cancellation_reason: reason,
      },
      {
        onSuccess: () => {
          router.visit(route("kine.my-sessions"));
        },
      }
    );
  };

  const handleSaveNotes = () => {
    setIsSaving(true);

    router.put(
      route("kine.sessions.update-notes", session.id),
      {
        notes: notes,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setIsSaving(false);
          setIsEditingNotes(false);
        },
        onError: () => {
          setIsSaving(false);
          alert("Error al guardar las notas");
        },
      }
    );
  };

  return (
    <KineLayout>
      <Head title={`Sesión - ${session.patient.name}`} />

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
                  Detalle de Sesión
                </h1>
                <p className="text-sm text-gray-600">
                  {new Date(session.date).toLocaleDateString("es-CL", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${config.color}`}
              >
                <StatusIcon className="inline w-4 h-4 mr-1" />
                {config.label}
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Información del paciente */}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Paciente</h2>
              {session.patient.phone && (
                <button
                  onClick={handleCallPatient}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white transition-colors bg-teal-600 rounded-lg hover:bg-teal-700"
                >
                  <Phone className="w-4 h-4" />
                  Llamar
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white rounded-full bg-gradient-to-br from-teal-400 to-blue-500">
                  {session.patient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {session.patient.name}
                  </p>
                  <p className="text-sm text-gray-600">{session.patient.rut}</p>
                </div>
              </div>

              {session.patient.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{session.patient.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Detalles de la sesión */}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h2 className="mb-3 font-semibold text-gray-900">
              Detalles de la sesión
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Fecha y hora</p>
                  <p className="font-medium text-gray-900">
                    {new Date(session.date).toLocaleDateString("es-CL")} -{" "}
                    {session.time}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                <Stethoscope className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Tipo de sesión</p>
                  <p className="font-medium text-gray-900">
                    {session.session_type.name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Duración</p>
                  <p className="font-medium text-gray-900">
                    {session.duration_actual || session.session_type.duration}{" "}
                    minutos
                  </p>
                </div>
              </div>

              {session.treatment.diagnosis && (
                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Diagnóstico</p>
                    <p className="font-medium text-gray-900">
                      {session.treatment.diagnosis}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Objetivos del tratamiento */}
          {session.treatment.objectives &&
            session.treatment.objectives.length > 0 && (
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h2 className="mb-3 font-semibold text-gray-900">
                  Objetivos del tratamiento
                </h2>
                <ul className="space-y-2">
                  {session.treatment.objectives.map((objective, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="text-teal-600">•</span>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Notas de la sesión */}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">
                Notas de la sesión
              </h2>
              {session.status === "Programada" && !isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="p-2 text-teal-600 transition-colors rounded-lg hover:bg-teal-50"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agrega notas sobre esta sesión..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingNotes(false);
                      setNotes(session.notes || "");
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {notes ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {notes}
                  </p>
                ) : (
                  <p className="text-sm italic text-gray-500">
                    Sin notas registradas
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Información de pago */}
          {session.status === "completed" && (
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h2 className="mb-3 font-semibold text-gray-900">
                Información de pago
              </h2>

              <div className="space-y-3">
                {session.status === "scheduled" && (
                  <>
                    <div className="flex items-center justify-between p-3 border-2 border-teal-200 rounded-lg bg-teal-50">
                      <div>
                        <span className="text-sm text-gray-600">
                          Valor Sesión
                        </span>
                        {/* <p className="text-xs text-gray-500">
                        ({session.payment.commission_rate}%)
                      </p> */}
                      </div>
                      <span className="text-xl font-bold text-teal-600">
                        ${session.payment.doctor_amount.toLocaleString("es-CL")}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Información de timestamps */}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h2 className="mb-3 font-semibold text-gray-900">Registro</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Creada el</span>
                <span className="font-medium text-gray-900">
                  {new Date(session.timestamps.created_at).toLocaleDateString(
                    "es-CL",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </div>

              {session.timestamps.completed_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Completada el</span>
                  <span className="font-medium text-green-600">
                    {new Date(
                      session.timestamps.completed_at
                    ).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          {session.status === "Programada" && (
            <div className="space-y-3">
              <button
                onClick={handleCompleteSession}
                className="flex items-center justify-center w-full gap-2 py-3 text-base font-semibold text-white transition-colors bg-green-600 rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg"
              >
                <CheckCircle2 className="w-5 h-5" />
                Completar Sesión
              </button>

              <button
                onClick={handleCancelSession}
                className="flex items-center justify-center w-full gap-2 py-3 text-base font-semibold text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                <XCircle className="w-5 h-5" />
                Cancelar Sesión
              </button>
            </div>
          )}

          {/* Info de sesión completada */}
          {session.status === "Completada" && (
            <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <p className="font-semibold text-green-900">
                  Sesión completada exitosamente
                </p>
              </div>
              <p className="text-sm text-green-700">
                Esta sesión fue completada el{" "}
                {new Date(session.timestamps.completed_at).toLocaleDateString(
                  "es-CL"
                )}
              </p>
            </div>
          )}

          {/* Info de sesión cancelada */}
          {session.status === "Cancelada" && (
            <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-6 h-6 text-red-600" />
                <p className="font-semibold text-red-900">Sesión cancelada</p>
              </div>
              <p className="text-sm text-red-700">
                Esta sesión fue cancelada y no generará comisión
              </p>
            </div>
          )}
        </div>
      </div>
    </KineLayout>
  );
}
