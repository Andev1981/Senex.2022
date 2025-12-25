import React from "react";
import { Calculator, CheckCircle2, Plus } from "lucide-react";
import ServiceItem from "./ServiceItem"; // Importamos el componente de arriba

export default function ServicesCard({
  servicesToBill,
  patientExtras,
  sessionTypes,
  doctors,
  onAddDebt,
  onAddService,
  onUpdateService,
  onRemoveService,
}) {
  return (
    <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl h-fit hover:scale-[1.01] transition-transform duration-200">
      {/* Título */}
      <h2 className="flex items-center mb-6 text-xl font-black text-gray-800">
        <span className="flex items-center justify-center w-8 h-8 mr-2 text-sm text-indigo-600 bg-indigo-100 rounded-full">
          2
        </span>
        Prestaciones
      </h2>

      {/* Sección Deudas (si existen) */}
      {patientExtras.debts.length > 0 && (
        <div className="p-4 mb-4 border border-orange-200 rounded-xl bg-orange-50/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-orange-800 flex items-center gap-2">
              <Calculator className="w-4 h-4" /> Deudas Pendientes
            </h3>
            <span className="px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full text-[10px] font-bold">
              {patientExtras.debts.length}
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {patientExtras.debts.map((debt) => {
              const isAdded = servicesToBill.some((s) => s.debt_id === debt.id);
              const displayAmount =
                debt.original_amount_clp || debt.original_amount || 0;

              return (
                <button
                  key={debt.id}
                  type="button"
                  disabled={isAdded}
                  onClick={() => onAddDebt(debt)}
                  className={`w-full flex justify-between items-center px-3 py-2.5 text-xs rounded-lg border transition-all duration-200 ${
                    isAdded
                      ? "bg-green-100 border-green-200 text-green-700 opacity-60 cursor-default"
                      : "bg-white border-orange-200 text-orange-800 hover:bg-orange-100 hover:shadow-sm transform hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-bold">
                      {debt.treatment_session?.session_type?.name || "Sesión"}
                    </span>
                    <span className="text-[10px] opacity-80">
                      {debt.treatment_session?.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      ${displayAmount.toLocaleString("es-CL")}
                    </span>
                    {isAdded && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de Servicios Agregados */}
      <div className="space-y-4">
        {servicesToBill.length === 0 && patientExtras.debts.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-sm text-gray-400">No hay servicios agregados.</p>
          </div>
        )}

        {servicesToBill.map((s, index) => (
          <ServiceItem
            key={index} // Idealmente usar un ID único si lo tuvieras, index sirve por ahora
            item={s}
            index={index}
            sessionTypes={sessionTypes}
            doctors={doctors}
            onUpdate={onUpdateService}
            onRemove={onRemoveService}
          />
        ))}

        {/* Botón Agregar */}
        <button
          type="button"
          onClick={onAddService}
          className="w-full py-3.5 text-xs font-bold text-indigo-500 transition-all border-2 border-indigo-100 border-dashed rounded-xl hover:bg-indigo-50 hover:border-indigo-200 flex items-center justify-center gap-2 group"
        >
          <div className="bg-indigo-100 text-indigo-600 rounded-full p-1 group-hover:bg-indigo-200 transition-colors">
            <Plus className="w-4 h-4" />
          </div>
          AÑADIR NUEVA PRESTACIÓN
        </button>
      </div>
    </div>
  );
}
