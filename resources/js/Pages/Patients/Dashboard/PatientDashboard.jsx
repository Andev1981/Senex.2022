import React from "react";
import {
  Activity,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  FileText,
} from "lucide-react";
import { Link } from "@inertiajs/react";

// Helper simple para formatear moneda (si no tienes uno global)
const fmtCLP = (value) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(value);
};

export default function PatientDashboard({ patient }) {
  // 1. Cálculos seguros (evitar error si patient.debts no existe)
  // Asumimos que patient trae la relación 'debts' o 'invoices' con saldo pendiente
  const totalDebt = patient.debt_amount || 0; // O la lógica que uses para calcular deuda

  // Asumimos que patient trae 'active_treatments'
  const activeTreatments = patient.active_treatments || [];
  const sessionsCount = patient.sessions_count || 0;

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      {/* 1. TARJETAS DE ESTADO (KPIs) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Estado Financiero */}
        <div
          className={`p-5 rounded-xl border flex items-center justify-between shadow-sm ${
            totalDebt > 0
              ? "bg-red-50 border-red-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-wider ${
                totalDebt > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {totalDebt > 0 ? "Deuda Pendiente" : "Estado de Cuenta"}
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {totalDebt > 0 ? fmtCLP(totalDebt) : "Al día"}
            </p>
          </div>
          <div
            className={`p-3 rounded-full ${
              totalDebt > 0
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {totalDebt > 0 ? (
              <AlertCircle className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>
        </div>

        {/* Resumen de Asistencia */}
        <div className="flex items-center justify-between p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
          <div>
            <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Total Atenciones
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {sessionsCount}
            </p>
          </div>
          <div className="p-3 text-blue-600 rounded-full bg-blue-50">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Próxima Cita (Placeholder) */}
        <div className="flex items-center justify-between p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
          <div>
            <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Próxima Cita
            </p>
            <p className="mt-1 text-sm font-medium text-gray-600">
              {patient.next_appointment
                ? patient.next_appointment
                : "Sin agendar"}
            </p>
          </div>
          <div className="p-3 text-purple-600 rounded-full bg-purple-50">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN TRATAMIENTOS ACTIVOS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <Activity className="w-5 h-5 text-blue-600" />
            Tratamientos en Curso
          </h3>
          {/* Botón opcional si quieres ir directo a crear uno */}
          {/* <button className="text-sm text-blue-600 hover:underline">+ Nuevo Tratamiento</button> */}
        </div>

        {activeTreatments.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {activeTreatments.map((treatment) => {
              // Cálculos de progreso (Simulados si no tienes el dato exacto aún)
              const sessionsDone = treatment.sessions_count || 0;
              const sessionsTotal = treatment.expected_sessions || 10;
              const progress = Math.min(
                (sessionsDone / sessionsTotal) * 100,
                100
              );

              return (
                <div
                  key={treatment.id}
                  className="flex flex-col p-5 transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md"
                >
                  {/* Cabecera Tarjeta */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-100 rounded-md mb-2">
                        {treatment.session_type?.name || "Kinesiología"}
                      </span>
                      <h4
                        className="text-base font-bold text-gray-900 line-clamp-2"
                        title={treatment.diagnostic?.description}
                      >
                        {treatment.diagnostic?.description ||
                          "Diagnóstico no especificado"}
                      </h4>
                      <p className="mt-1 text-xs text-gray-500">
                        Tratante: {treatment.doctor?.name || "Por asignar"}
                      </p>
                    </div>
                    {/* Indicador de estado */}
                    <div
                      className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"
                      title="Activo"
                    ></div>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="mt-auto mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-gray-500">
                        Progreso del plan
                      </span>
                      <span className="font-bold text-gray-900">
                        {sessionsDone} / {sessionsTotal}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-2 transition-all duration-700 ease-out bg-blue-600 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Botones de Acción Rápida */}
                  <div className="flex gap-3 pt-4 border-t border-gray-50">
                    <Link
                      href="#" // Aquí podrías poner una ruta para registrar sesión directo
                      className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" /> Registrar Sesión
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // EMPTY STATE (Si no tiene tratamientos activos)
          <div className="p-8 text-center border-2 border-gray-200 border-dashed bg-gray-50 rounded-xl">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 text-gray-400 bg-gray-100 rounded-full">
              <FileText className="w-6 h-6" />
            </div>
            <p className="font-medium text-gray-500">
              No hay tratamientos activos actualmente.
            </p>
            <p className="mb-4 text-sm text-gray-400">
              Inicia una evaluación para comenzar un plan.
            </p>
            <button className="font-bold text-blue-600 hover:underline">
              + Iniciar Nueva Evaluación
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
