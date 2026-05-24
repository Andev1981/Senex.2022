import ApplicationLogo from "@/components/ApplicationLogo";
import Dropdown from "@/components/Dropdown";
import { Link } from "@inertiajs/react";
import {
  Bell,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

function NavClient({ user }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8">
      <div className="flex items-center justify-between h-full max-w-[1600px] mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-4">
            <Link href={route('patient.dashboard')} className="flex items-center gap-3 group">
                <div className="p-2 bg-brand-primary rounded-xl shadow-lg shadow-brand-primary/20 group-hover:rotate-6 transition-transform">
                    <ApplicationLogo className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-black text-gray-900 tracking-tight uppercase">Mi Portal</span>
            </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6">
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
                <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest leading-none">Paciente</p>
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
                        <p className="text-[10px] text-brand-gray truncate font-bold uppercase tracking-widest">{user.email || user.rut}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 border-t border-gray-100 bg-white">
                    <Link
                      href={route("patient.logout")}
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

export default NavClient;
