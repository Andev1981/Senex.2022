import React from "react";
import { Head, router } from "@inertiajs/react";
import { 
  User, 
  Settings, 
  ChevronRight, 
  Wallet, 
  FileText, 
  LogOut, 
  Shield, 
  Bell,
  CheckCircle2,
  TrendingUp,
  Clock
} from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";

export default function MyProfile({ doctor, stats }) {
  const handleLogout = () => {
    if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
      router.post(route("logout"));
    }
  };

  return (
    <KineLayout>
      <Head title="Mi Perfil" />

      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Cabecera de Perfil - Estilo App Premium */}
        <div className="bg-white px-6 pt-8 pb-10 rounded-b-[40px] shadow-sm border-b border-slate-100">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
                <div className="w-24 h-24 bg-brand-primary/10 rounded-[32px] flex items-center justify-center border-4 border-white shadow-xl">
                    <User className="w-12 h-12 text-brand-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{doctor.name} {doctor.last_name}</h1>
            <p className="text-brand-primary font-bold uppercase text-[10px] tracking-[0.2em] mt-1">{doctor.speciality || 'Kinesiólogo'}</p>
            <div className="mt-2 inline-flex items-center px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {doctor.branch?.name || 'Sucursal Principal'}
            </div>
          </div>
        </div>

        {/* Dashboard Financiero Rápido (Billetera) */}
        <div className="px-6 -mt-8">
            <div className="bg-slate-900 rounded-[32px] p-6 shadow-2xl shadow-slate-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Ganancias del Mes</p>
                        <h2 className="text-white text-3xl font-black tracking-tighter">
                            ${stats.commission_month?.toLocaleString('es-CL') || 0}
                        </h2>
                    </div>
                    <div className="bg-brand-primary/20 p-3 rounded-2xl">
                        <Wallet className="w-6 h-6 text-brand-primary" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                    <div>
                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1">Sesiones</p>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            <span className="text-white font-bold text-sm">{stats.sessions_month || 0}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1">Ranking</p>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 text-brand-primary" />
                            <span className="text-white font-bold text-sm">#1 Top</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Menú de Opciones */}
        <div className="px-6 py-8 space-y-6">
            <div>
                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 mb-4">Mi Actividad</h3>
                <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100">
                    <button 
                        onClick={() => router.visit(route('kine.my-wallet'))}
                        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors border-b border-slate-50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-50 p-2.5 rounded-xl"><FileText className="w-5 h-5 text-blue-500" /></div>
                            <span className="font-bold text-slate-700">Mis Liquidaciones</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                    </button>
                    <button 
                        onClick={() => router.visit(route('kine.my-wallet'))}
                        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-50 p-2.5 rounded-xl"><Clock className="w-5 h-5 text-orange-500" /></div>
                            <span className="font-bold text-slate-700">Historial de Pagos</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                    </button>
                </div>
            </div>

            <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 p-5 bg-red-50 text-red-600 rounded-[32px] font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-colors"
            >
                <LogOut className="w-5 h-5" /> Cerrar Sesión
            </button>
        </div>
      </div>
    </KineLayout>
  );
}
