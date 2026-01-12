// resources/js/pages/KineMobile/Components/QuickActions.jsx
import React from "react";
import { router } from "@inertiajs/react";
import { Users, Calendar, User, Activity } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      icon: Users,
      label: "Mis Pacientes",
      route: "kine.my-patients",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Calendar,
      label: "Mis Sesiones",
      route: "kine.my-sessions",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: User,
      label: "Mi Perfil",
      route: "kine.my-profile",
      color: "from-teal-500 to-teal-600",
    },
  ];

  return (
    <div className="px-4 py-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Acceso rápido
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.route}
              onClick={() => router.visit(route(action.route))}
              className={`p-4 bg-gradient-to-br ${action.color} rounded-lg shadow-md hover:shadow-lg transition-all text-white`}
            >
              <Icon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-xs font-medium text-center">{action.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
