// resources/js/Layouts/KineLayout.jsx
import React from "react";
import { router, usePage } from "@inertiajs/react";
import { Home, Users, Calendar, User, LogOut, Plus } from "lucide-react";

export default function KineLayout({ children }) {
  const { url } = usePage();

  const navItems = [
    {
      icon: Home,
      label: "Inicio",
      route: "kine.dashboard",
      active: url === "/kine/dashboard",
    },
    {
      icon: Users,
      label: "Pacientes",
      route: "kine.my-patients",
      active:
        url.startsWith("/kine/my-patients") ||
        url.startsWith("/kine/patients/"),
    },
    {
      icon: Calendar,
      label: "Sesiones",
      route: "kine.my-sessions",
      active:
        url.startsWith("/kine/my-sessions") ||
        url.startsWith("/kine/sessions/"),
    },
    {
      icon: User,
      label: "Perfil",
      route: "kine.my-profile",
      active: url === "/kine/my-profile",
    },
  ];

  const handleLogout = () => {
    if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
      router.post(route("logout"));
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="pb-16">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid max-w-lg grid-cols-5 mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.route}
                onClick={() => router.visit(route(item.route))}
                className={`flex flex-col items-center justify-center py-3 transition-colors ${
                  item.active
                    ? "text-teal-600 bg-teal-50"
                    : "text-gray-600 hover:text-teal-600 hover:bg-gray-50"
                }`}
              >
                <Icon
                  className={`w-6 h-6 mb-1 ${item.active ? "stroke-2" : ""}`}
                />
                <span
                  className={`text-xs ${item.active ? "font-semibold" : ""}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center py-3 text-gray-600 transition-colors hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-6 h-6 mb-1" />
            <span className="text-xs">Salir</span>
          </button>
        </div>
      </nav>
      <div className="fixed z-50 bottom-20 right-4">
        <button
          onClick={() => router.visit(route("kine.sessions.create"))}
          className="flex items-center justify-center w-14 h-14 text-white transition-all shadow-lg bg-gradient-to-r from-teal-500 to-blue-500 rounded-full hover:shadow-xl hover:scale-110"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
