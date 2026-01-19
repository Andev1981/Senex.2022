import React from "react";
import { FileClock, FolderOpen, Stethoscope } from "lucide-react";
import TableTreatments from "./table-treatments";

export default function TreatmentModal({
  treatments = [],
  handleTreatmentModal,
  setOpenTreatmentModal,
  diagnostics
}) {
  return (
    <div className="flex flex-col h-full bg-white pt-6">
      
      {/* 1. HEADER DEL MODAL (Contexto) */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black text-gray-800 uppercase tracking-tight">
            <FileClock className="w-5 h-5 text-brand-primary" />
            Historial de Tratamientos
          </h2>
          <p className="text-xs text-gray-400 font-medium mt-1 ml-7">
            Listado completo de planes clínicos activos e históricos.
          </p>
        </div>
        
        {/* Badge de cantidad */}
        <div className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 shadow-sm">
           {treatments.length} Registros
        </div>
      </div>

      {/* 2. CONTENIDO (Tabla o Empty State) */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {treatments.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <TableTreatments
              treatments={treatments}
              handleTreatmentModal={handleTreatmentModal}
              setOpenModalTreatmentsList={setOpenTreatmentModal} // Asumo que esta es la prop que cierra el modal en la tabla
            />
          </div>
        ) : (
          /* ESTADO VACÍO */
          <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
              <Stethoscope className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-wide">
              Sin tratamientos registrados
            </h3>
            <p className="text-xs text-gray-400 mt-2 max-w-xs">
              Este paciente no tiene historial de planes clínicos anteriores.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}