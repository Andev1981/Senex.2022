import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import { Link } from "@inertiajs/react";
import {
  Bell,
  Building2,
  ChevronDown,
  Clock,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  Shield,
  User,
  UserCircle2,
} from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

function Nav({ user }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      type: "cita",
      message: "Nueva cita agendada",
      time: "Hace 5 min",
      unread: true,
    },
    {
      id: 2,
      type: "pago",
      message: "Pago recibido de Juan Pérez",
      time: "Hace 15 min",
      unread: true,
    },
    {
      id: 3,
      type: "sistema",
      message: "Actualización disponible",
      time: "Hace 1 hora",
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          {/*  <div className="relative">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Buscar pacientes, citas, documentos..."
              className="w-full py-2 pl-10 pr-4 transition-colors border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div> */}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3 ml-6">
          {/* Quick Actions */}
          <button className="p-2 transition-colors rounded-lg hover:bg-gray-100">
            <Clock className="w-5 h-5 text-gray-600" />
          </button>

          <button className="p-2 transition-colors rounded-lg hover:bg-gray-100">
            <MessageSquare className="w-5 h-5 text-gray-600" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 transition-colors rounded-lg hover:bg-gray-100"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute w-2 h-2 bg-red-500 rounded-full top-1 right-1"></span>
            </button>

            {notificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setNotificationsOpen(false)}
                ></div>
                <div className="absolute right-0 z-20 bg-white border border-gray-200 shadow-2xl top-12 w-80 rounded-xl">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">
                        Notificaciones
                      </h3>
                      <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                        {notifications.filter((n) => n.unread).length} nuevas
                      </span>
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-96">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          notification.unread ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-2 h-2 mt-2 rounded-full ${
                              notification.unread
                                ? "bg-blue-600"
                                : "bg-gray-300"
                            }`}
                          ></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.message}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <button className="w-full text-sm font-medium text-center text-blue-600 hover:text-blue-700">
                      Ver todas las notificaciones
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200"></div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 px-3 py-2 transition-colors rounded-lg hover:bg-gray-100"
            >
              <div className="flex items-center justify-center rounded-lg w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-600">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden text-left lg:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user.name}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {user.last_name}
                </p>
                {/* <p className="text-xs text-gray-500">Kinesiólogo</p> */}
              </div>
              <ChevronDown className="hidden w-4 h-4 text-gray-600 lg:block" />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                ></div>
                <div className="absolute right-0 z-20 w-64 bg-white border border-gray-200 shadow-2xl top-12 rounded-xl">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user.name + " " + user.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button className="flex items-center w-full gap-3 px-3 py-2 text-gray-700 transition-colors rounded-lg hover:bg-gray-100">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">Mi Perfil</span>
                    </button>
                    <button className="flex items-center w-full gap-3 px-3 py-2 text-gray-700 transition-colors rounded-lg hover:bg-gray-100">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Mi Clínica</span>
                    </button>
                    <button className="flex items-center w-full gap-3 px-3 py-2 text-gray-700 transition-colors rounded-lg hover:bg-gray-100">
                      <Settings className="w-4 h-4" />
                      <span className="text-sm font-medium">Configuración</span>
                    </button>
                    <button className="flex items-center w-full gap-3 px-3 py-2 text-gray-700 transition-colors rounded-lg hover:bg-gray-100">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">Privacidad</span>
                    </button>
                  </div>
                  <div className="p-2 border-t border-gray-200">
                    <Link
                      href={route("logout")}
                      method="post"
                      as="button"
                      className="flex items-center w-full gap-3 px-3 py-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Cerrar Sesión</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Nav;
