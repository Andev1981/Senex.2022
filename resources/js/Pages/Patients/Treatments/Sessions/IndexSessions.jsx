import React from "react";
import { ClipboardList, Plus, FolderOpen } from "lucide-react"; // Iconos más específicos
import TableSessions from "./TableSessions";
import { getStatusConfig } from "@/constants/treatmentStatuses";

export default function IndexSessions({
  sessions,
  handleOpenModalSession,
  handleOpenModalSessionShow,
  treatment,
  setIsDuplicate,
}) {
  // Lógica de Negocio (Intacta)
  const isActiveStatus = ["evaluation", "in_progress"].includes(treatment.status);
  
  const hasCapacity =
    treatment.is_indefinite ||
    treatment.total_sessions > treatment.completed_sessions;

  const canRegisterSession = isActiveStatus && hasCapacity;


  return (
    <div className="bg-white border border-gray-200 rounded-[1.5rem] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- HEADER DE SECCIÓN --- */}
      <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black text-gray-800 uppercase tracking-tight">
            <ClipboardList className="w-5 h-5 text-brand-primary" /> 
            Bitácora de Sesiones
          </h2>
          <p className="text-xs text-gray-400 font-medium mt-1 ml-7">
            Historial de evoluciones y atenciones realizadas.
          </p>
        </div>

        {/* Botón de Acción (Solo si cumple condiciones) */}
        {canRegisterSession && (
          <button
            onClick={() => handleOpenModalSession([], treatment)}
            className="group flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <div className="bg-white/20 rounded-full p-0.5 group-hover:rotate-90 transition-transform">
                <Plus className="w-3 h-3" />
            </div>
            Registrar Sesión
          </button>
        )}
      </div>

      {/* --- CONTENIDO --- */}
      <div className="p-0">
        {sessions.length === 0 ? (
          
          /* CASO 1: EMPTY STATE (Diseño mejorado) */
          <div className="py-16 px-6 text-center flex flex-col items-center justify-center bg-gray-50/30">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400 shadow-inner">
              <FolderOpen className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-sm font-black text-gray-600 uppercase tracking-wide">
              Sin historial clínico
            </h3>
            <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
              Aún no se han registrado sesiones para este tratamiento. 
              {!isActiveStatus && (
                <span className="block mt-1 text-orange-500 font-medium">
                   Nota: El tratamiento se encuentra en estado "{getStatusConfig(treatment.status).label}".
                </span>
              )}
            </p>

            {/* Botón Call-to-Action en el vacío */}
            {canRegisterSession && (
                <button
                    onClick={() => handleOpenModalSession([], treatment)}
                    className="mt-6 text-brand-primary text-xs font-bold hover:underline underline-offset-4 decoration-2"
                >
                    + Iniciar primera sesión ahora
                </button>
            )}
          </div>

        ) : (
          
          /* CASO 2: TABLA DE DATOS */
          <div className="overflow-hidden">
            <TableSessions
              sessions={sessions}
              treatment={treatment}
              setIsDuplicate={setIsDuplicate}
              handleOpenModalSession={handleOpenModalSession}
              handleOpenModalSessionShow={handleOpenModalSessionShow}
            />
          </div>
        )}
      </div>
    </div>
  );
}