import { List, Plus, Activity } from "lucide-react";

export default function AttendancesHeader({ openCreateUpdateSessionModal, totalSessions = 0 }) {
  return (
    <div className="p-8 mb-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 shadow-xl shadow-brand-primary/20 bg-brand-primary rounded-2xl transform rotate-3">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">Registro de Atenciones</h1>
            <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
              Gestión Clínica & Flujo de Pacientes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
              {totalSessions} Sesiones en Filtro
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
