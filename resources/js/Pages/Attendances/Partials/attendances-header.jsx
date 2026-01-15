import { List, Plus } from "lucide-react";

export default function AttendancesHeader({ openCreateUpdateSessionModal }) {
  return (
    <div className="p-8 mb-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 shadow-xl shadow-brand-primary/20 bg-brand-primary rounded-2xl transform rotate-3">
            <List className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">Agenda de Atenciones</h1>
            <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
              Registro Clínico & Sesiones Diarias
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openCreateUpdateSessionModal({})}
            className="group flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-brand-primary/20 transition-all active:scale-95 cursor-pointer"
          >
            <div className="bg-white/20 rounded-full p-0.5 group-hover:rotate-90 transition-transform">
                <Plus className="w-3 h-3" />
            </div>
            Nueva Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
