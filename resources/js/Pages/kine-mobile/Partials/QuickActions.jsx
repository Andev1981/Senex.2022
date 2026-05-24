// resources/js/pages/KineMobile/components/QuickActions.jsx
import { router } from "@inertiajs/react";
import { Users, ClipboardList, User, Wallet, Search, Stethoscope } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      icon: Users,
      label: "Pacientes",
      route: "kine.my-patients",
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      icon: ClipboardList,
      label: "Atenciones",
      route: "kine.pending-sessions",
      color: "bg-slate-50 text-slate-600 border-slate-100",
    },
    {
      icon: Wallet,
      label: "Mis Pagos",
      route: "kine.my-wallet",
      color: "bg-orange-50 text-orange-600 border-orange-100",
    },
  ];

  return (
    <div className="px-6 py-4">
      <h3 className="mb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
        Accesos Directos
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.route}
              onClick={() => router.visit(route(action.route))}
              className={`flex flex-col items-center gap-3 p-5 rounded-[32px] border transition-all active:scale-95 shadow-sm shadow-slate-100 ${action.color} bg-white`}
            >
              <div className="p-1 rounded-xl">
                <Icon className="w-6 h-6 stroke-[2.5px]" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-tighter text-slate-800">{action.label}</p>
            </button>
          );
        })}
      </div>
      
      {/* Botón de búsqueda de pacientes (Floating style inline) */}
      <div className="mt-6">
          <button 
            onClick={() => router.visit(route('kine.my-patients'))}
            className="w-full bg-slate-900 py-4 px-6 rounded-[32px] flex items-center justify-between group active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10"
          >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                    <Search className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-black text-white uppercase tracking-widest">Buscar Paciente...</span>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-900 transition-all">
                  <Users className="w-4 h-4" />
              </div>
          </button>
      </div>
    </div>
  );
}
