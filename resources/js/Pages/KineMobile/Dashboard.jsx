import React from "react";
import { Head, Link } from "@inertiajs/react";
import {
  Activity,
  Calendar,
  DollarSign,
  Home,
  CalendarCheck,
  CreditCard,
  User,
  Plus,
  TrendingUp,
} from "lucide-react";

export default function Dashboard({ doctor, kpis, agenda, patientsCount }) {
  return (
    <>
      <Head title="Dashboard - Kine Portal" />

      <div className="min-h-screen pb-20 bg-gray-50">
        {/* Header */}
        <div className="p-4 text-white shadow-lg bg-gradient-to-r from-blue-600 to-blue-700">
          <h1 className="text-xl font-bold">¡Hola, {doctor.name}!</h1>
          <p className="mt-1 text-sm text-blue-100">
            {new Date().toLocaleDateString("es-CL", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 p-4">
          {/* Sesiones Hoy */}
          <div className="p-4 bg-white shadow rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-blue-600">
              <Activity className="w-5 h-5" />
              <span className="text-xs font-medium">Hoy</span>
            </div>
            <div className="text-2xl font-bold">{kpis.sessions_today}</div>
            <div className="mt-1 text-xs text-gray-500">sesiones</div>
          </div>

          {/* Ingresos Hoy */}
          <div className="p-4 bg-white shadow rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-green-600">
              <DollarSign className="w-5 h-5" />
              <span className="text-xs font-medium">Hoy</span>
            </div>
            <div className="text-2xl font-bold">
              ${kpis.today_earnings.toLocaleString("es-CL")}
            </div>
            <div className="mt-1 text-xs text-gray-500">ganado</div>
          </div>

          {/* Sesiones Este Mes */}
          <div className="p-4 bg-white shadow rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-purple-600">
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-medium">Este mes</span>
            </div>
            <div className="text-2xl font-bold">{kpis.completed_today}</div>
            <div className="mt-1 text-xs text-gray-500">sesiones</div>
          </div>

          {/* Ingresos Este Mes */}
          <div className="p-4 bg-white shadow rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-orange-600">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-medium">Este mes</span>
            </div>
            <div className="text-2xl font-bold">
              ${kpis.month_earnings.toLocaleString("es-CL")}
            </div>
            <div className="mt-1 text-xs text-gray-500">ganado</div>
          </div>
        </div>

        {/* Próximas Sesiones */}
        {agenda.length > 0 && (
          <div className="px-4 mb-6">
            <h2 className="mb-3 text-lg font-bold">Próximas Sesiones</h2>
            <div className="space-y-2">
              {agenda.map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-white rounded-lg shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {session.patient.name} {session.patient.last_name}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {session.session_type.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-600">
                        {new Date(session.date).toLocaleDateString("es-CL")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón Flotante - Crear Sesión */}
        <Link
          /*   href={route("kine.sessions.create")} */
          className="fixed flex items-center justify-center text-white transition bg-blue-600 rounded-full shadow-lg bottom-20 right-4 w-14 h-14 active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </Link>

        {/* Bottom Navigation */}
        <BottomNav active="dashboard" />
      </div>
    </>
  );
}

// Bottom Navigation Component
function BottomNav({ active }) {
  const navItems = [
    { name: "Inicio", route: "kine.dashboard", icon: Home },
    { name: "Sesiones", route: "kine.sessions.index", icon: CalendarCheck },
    { name: "Pagos", route: "kine.payments", icon: CreditCard },
    { name: "Perfil", route: "kine.profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              /* href={route(item.route)} */
              className={`flex flex-col items-center px-3 py-2 ${
                active === item.route.split(".")[1]
                  ? "text-blue-600"
                  : "text-gray-400"
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  active === item.route.split(".")[1]
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              />
              <span className="text-xs">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
