// resources/js/Pages/KineMobile/Dashboard.jsx
import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";
import KPICard from "./Partials/KPICard";
import SessionCard from "./Partials/SessionCard";
import QuickActions from "./Partials/QuickActions";

export default function Dashboard({
  doctor,
  kpis,
  agenda,
  upcomingSessions,
  activePatientsCount,
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.reload({
      only: ["kpis", "agenda"],
      onFinish: () => {
        setTimeout(() => setIsRefreshing(false), 500);
      },
    });
  };

  const handleCompleteSession = (session) => {
    router.post(
      route("kine.sessions.complete", session.id),
      {
        notes: "",
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          router.reload({ only: ["kpis", "agenda"] });
        },
      }
    );
  };

  const handleCancelSession = (session) => {
    const reason = prompt("Motivo de cancelación:");
    if (!reason) return;

    router.post(
      route("kine.sessions.cancel", session.id),
      {
        cancellation_reason: reason,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          router.reload({ only: ["kpis", "agenda"] });
        },
      }
    );
  };

  return (
    <KineLayout>
      <Head title="Mi Dashboard" />

      <div className="min-h-screen pb-20 bg-gradient-to-br from-teal-50 to-blue-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Hola, {doctor.name.split(" ")[0]} 👋
                </h1>
                <p className="text-sm text-gray-600">{doctor.speciality}</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-teal-600 transition-all rounded-full hover:bg-teal-50"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="px-4 py-4 space-y-3">
          {/* KPIs del día */}
          <div className="grid grid-cols-2 gap-3">
            <KPICard
              icon={Calendar}
              label="Sesiones hoy"
              value={kpis.sessions_today}
              color="blue"
            />
            <KPICard
              icon={CheckCircle2}
              label="Completadas"
              value={kpis.completed_today}
              color="green"
            />
            <KPICard
              icon={Clock}
              label="Pendientes"
              value={kpis.pending_today}
              color="orange"
            />
            <KPICard
              icon={TrendingUp}
              label="Ganancias hoy"
              value={`$${kpis.today_earnings.toLocaleString("es-CL")}`}
              color="teal"
              small
            />
          </div>

          {/* Stats secundarios */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>Pacientes activos</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {activePatientsCount}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Próximas sesiones</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {upcomingSessions}
              </p>
            </div>
          </div>

          {/* Resumen mensual */}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Resumen del mes
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600">Sesiones</p>
                <p className="text-xl font-bold text-teal-600">
                  {kpis.month_sessions}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Ingresos</p>
                <p className="text-xl font-bold text-teal-600">
                  ${kpis.month_earnings.toLocaleString("es-CL")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Agenda del día */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">
              Mi agenda de hoy
            </h2>
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString("es-CL", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>

          {agenda.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg shadow-sm">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600">
                No tienes sesiones programadas hoy
              </p>
              <p className="text-sm text-gray-500">¡Disfruta tu día! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agenda.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onComplete={handleCompleteSession}
                  onCancel={handleCancelSession}
                />
              ))}
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <QuickActions />
      </div>
    </KineLayout>
  );
}
