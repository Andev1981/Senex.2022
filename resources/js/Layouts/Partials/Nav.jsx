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
    <header className="sticky top-0 z-20 h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8">
      <div className="flex items-center justify-between h-full max-w-[1600px] mx-auto">
        {/* Search */}
        <div className="flex-1 max-w-xl">
            <div className="relative group">
                <Search className="absolute w-4 h-4 text-brand-gray transform -translate-y-1/2 left-4 top-1/2 group-focus-within:text-brand-primary transition-colors" />
                <input
                type="text"
                placeholder="Buscar en el sistema..."
                className="w-full py-3 pl-12 pr-4 transition-all border-gray-50 bg-gray-50/50 rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 focus:bg-white text-sm font-medium outline-none"
                />
            </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6 ml-8">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-3 transition-all rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 text-brand-gray group"
            >
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="absolute w-2 h-2 bg-red-500 rounded-full top-2.5 right-2.5 border-2 border-white"></span>
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-100"></div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-4 pl-2 pr-4 py-2 transition-all rounded-[1.2rem] hover:bg-gray-50 border border-transparent hover:border-gray-100 group"
            >
              <div className="flex items-center justify-center rounded-xl w-10 h-10 bg-brand-primary shadow-lg shadow-brand-primary/20 transform group-hover:rotate-6 transition-transform">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden text-left lg:block">
                <p className="text-xs font-black text-gray-900 uppercase tracking-tight leading-none mb-1">
                  {user.name}
                </p>
                <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest leading-none">Mi Perfil</p>
              </div>
              <ChevronDown className={`hidden w-4 h-4 text-brand-gray lg:block transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                ></div>
                <div className="absolute right-0 z-20 w-72 mt-4 bg-white border border-gray-100 shadow-2xl rounded-3xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
                  <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-gray-900 truncate uppercase text-sm tracking-tight">
                          {user.name}
                        </p>
                        <p className="text-[10px] text-brand-gray truncate font-bold uppercase tracking-widest">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 border-t border-gray-100 bg-white">
                    <Link
                      href={route("logout")}
                      method="post"
                      as="button"
                      className="flex items-center w-full gap-4 px-4 py-4 text-red-500 transition-all rounded-2xl hover:bg-red-50 group font-black uppercase tracking-widest text-[10px]"
                    >
                      <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      Cerrar Sesión
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
