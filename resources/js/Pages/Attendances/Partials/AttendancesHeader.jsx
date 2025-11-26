import { List, Plus } from "lucide-react";

export default function AttendancesHeader({ openCreateSessionModal }) {
  return (
    <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
            <List className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Atenciones & Sesiones
            </h1>
            <p className="text-sm text-gray-600">
              Gestiona la agenda clínica, registra sesiones y cobra al instante
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openCreateSessionModal}
            className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 shadow-blue-500/30"
          >
            <Plus className="w-4 h-4" />
            Nueva Atención
          </button>
        </div>
      </div>
    </div>
  );
}
