import React, { useEffect, useState, lazy, Suspense } from "react";
import { router, usePage } from "@inertiajs/react";
import { Home, Users, Calendar, Clock, User, LogOut, Plus, Wallet, Stethoscope, ClipboardList, CheckCircle, AlertCircle, X } from "lucide-react";

const DevToolbar = lazy(() => import("@/components/DevToolbar"));

export default function KineLayout({ children }) {
  const { url, props } = usePage();
  const { auth, flash, env } = props;
  const user = auth?.user;
  const roles = auth?.roles || [];
  const doctorBranch = auth?.doctor_branch ?? {};
  const userIsSuperAdmin = roles.includes("superadmin");
  const userIsKine = roles.includes("kine");
  const canManageSchedule = doctorBranch?.can_manage_schedule !== false;
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({ message: '', type: 'success' });

  const showDevToolbar = env === 'local' || userIsSuperAdmin || userIsKine;

  useEffect(() => {
    if (flash.success || flash.error || flash.message) {
        setToastData({
            message: flash.success || flash.error || flash.message,
            type: flash.error ? 'error' : 'success'
        });
        setShowToast(true);
        const timer = setTimeout(() => setShowToast(false), 5000);
        return () => clearTimeout(timer);
    }
  }, [flash]);

  // Limpiamos la URL de query strings para el match
  const currentPath = (url || "").split('?')[0];

  const navItems = [
    { icon: Home,          label: "Inicio",     route: "kine.dashboard",        active: currentPath === "/kine/dashboard" },
    { icon: Users,         label: "Pacientes",  route: "kine.my-patients",      active: currentPath.startsWith("/kine/my-patients") || currentPath.startsWith("/kine/patient") },
    { icon: Clock,         label: "Horario",    route: "kine.my-schedule",      active: currentPath.startsWith("/kine/my-schedule") },
    { icon: ClipboardList, label: "Atenciones", route: "kine.pending-sessions", active: currentPath.startsWith("/kine/pending-sessions") },
    { icon: Wallet,        label: "Pagos",      route: "kine.my-wallet",        active: currentPath.startsWith("/kine/my-wallet") || currentPath.startsWith("/kine/wallet") },
  ].filter(item => {
    if (item.route === "kine.my-schedule") {
        return canManageSchedule;
    }
    return true;
  });

  const handleLogout = () => {
    if (confirm("¿Cerrar sesión?")) router.post(route("logout"));
  };

  return (
    <div className={`relative min-h-screen bg-[#FDFDFD] flex flex-col font-sans antialiased text-slate-900`}>
      
      {showDevToolbar && (
        <Suspense fallback={null}>
          <DevToolbar />
        </Suspense>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 left-4 right-4 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`p-4 rounded-[24px] shadow-2xl flex items-center gap-3 border ${toastData.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-white border-slate-100 text-slate-800'}`}>
                {toastData.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-500" /> : <CheckCircle className="w-5 h-5 text-brand-primary" />}
                <p className="text-xs font-black uppercase tracking-tight flex-1">{toastData.message}</p>
                <button onClick={() => setShowToast(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                </button>
            </div>
        </div>
      )}

      {/* APP HEADER - Estilo Soft & Pro */}
      <header className="sticky top-0 z-[60] bg-brand-primary/30 backdrop-blur-xl border-b border-brand-primary/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="bg-brand-primary p-1.5 rounded-lg shadow-sm">
                <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest leading-none text-brand-primary opacity-80">Plataforma</span>
                <span className="text-sm font-black leading-none tracking-tight text-slate-800">SENEX <span className="text-brand-primary">KINE</span></span>
            </div>
        </div>
        
        {/* Avatar y Perfil Rápido */}
        <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-900 leading-none">{user?.name}</span>
                <span className="text-[8px] font-bold text-brand-primary uppercase tracking-tighter mt-1">Kinesiólogo</span>
            </div>
            <button 
                onClick={() => router.visit(route('kine.my-profile'))}
                className={`w-9 h-9 rounded-full border-2 shadow-sm overflow-hidden bg-white flex items-center justify-center transition-all ${currentPath.includes('profile') ? 'border-brand-primary ring-4 ring-brand-primary/10' : 'border-white'}`}
            >
                {user?.profile_photo_url ? (
                    <img src={user.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-brand-primary/5 flex items-center justify-center">
                         <User className="w-5 h-5 text-brand-primary" />
                    </div>
                )}
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-28 lg:pb-10 max-w-5xl mx-auto w-full">
        {children}
      </main>

      {/* BOTTOM NAVIGATION - Estilo Premium Nativo */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-100 px-2 pb-5 pt-1 lg:hidden">
        <div className="flex justify-around items-center max-w-md mx-auto relative px-4">
          
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={item.route}
                onClick={() => router.visit(route(item.route))}
                className={`flex flex-col items-center gap-1 transition-all py-2 relative ${
                  item.active ? "text-brand-primary" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${item.active ? "scale-110" : "scale-100"}`}>
                    <Icon className={`w-5 h-5 ${item.active ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tighter transition-all ${item.active ? "opacity-100" : "opacity-60"}`}>
                  {item.label}
                </span>
                
                {/* Indicador de Punto Activo */}
                {item.active && (
                    <span className="absolute -bottom-1 w-1 h-1 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(var(--brand-primary-rgb),0.6)] animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
