import React from "react";
import { Calculator, CheckCircle2, Plus } from "lucide-react";
import ServiceItem from "./ServiceItem"; // Importamos el componente de arriba
import PlanItem from "./PlanItem"; // <-- 1. Importar PlanItem
import {fmtDate} from "@/utils/utils";

export default function ServicesCard({
  servicesToBill,
  patientExtras,
  sessionTypes,
  doctors,
  onAddDebt,
  onAddService,
  onUpdateService,
  onRemoveService,
  business_type = "clinical",
}) {
  const isClinical = business_type === "clinical";

  return (
    <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-3xl h-fit hover:scale-[1.01] transition-all duration-300">
      {/* Título */}
      <h2 className="flex items-center mb-8 text-xl font-black text-gray-800 tracking-tight">
        <span className="flex items-center justify-center w-8 h-8 mr-3 text-xs font-black text-brand-primary bg-brand-secondary/10 rounded-xl">
          2
        </span>
        {isClinical ? "Prestaciones y Productos" : "Detalle de Venta"}
      </h2>

      {/* Sección Deudas (si existen - SOLO CLÍNICO por ahora) */}
      {isClinical && patientExtras.debts?.length > 0 && (
        <div className="p-6 mb-6 border-2 border-orange-100 rounded-[2rem] bg-orange-50/30 shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-orange-700 uppercase tracking-widest flex items-center gap-2">
              <Calculator className="w-4 h-4" /> Deudas Pendientes
            </h3>
            <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-xl text-[10px] font-black">
              {patientExtras.debts.length}
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {patientExtras.debts.map((debt) => {
              const isAdded = servicesToBill.some((s) => s.debt_id === debt.id);
              const displayAmount =
                debt.amount_patient_clp || debt.total_amount_clp || 0;

              return (
                <button
                  key={debt.id}
                  type="button"
                  disabled={isAdded}
                  onClick={() => onAddDebt(debt)}
                  className={`w-full flex justify-between items-center px-4 py-4 text-xs rounded-2xl border-2 transition-all duration-300 ${
                    isAdded
                      ? "bg-green-100 border-green-200 text-green-700 opacity-60 cursor-default shadow-none"
                      : "bg-white border-orange-100 text-orange-800 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-200/50 transform hover:-translate-y-1"
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-black uppercase tracking-tight text-sm">
                      {debt.treatment_session?.session_type?.name || "Sesión"}
                    </span>
                    <span className="mt-1 font-mono text-[10px] font-bold opacity-60">
                      {fmtDate(debt.treatment_session?.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-base">
                      ${displayAmount.toLocaleString("es-CL")}
                    </span>
                    {isAdded && <CheckCircle2 className="w-5 h-5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de Servicios Agregados */}
      <div className="space-y-5">
        {servicesToBill.length === 0 && (!patientExtras.debts || patientExtras.debts.length === 0) && (
          <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/30">
            <div className="flex justify-center mb-4">
                <Plus className="w-12 h-12 text-gray-200" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">No hay ítems agregados</p>
          </div>
        )}

        {servicesToBill.map((item, index) => (
          item.is_plan ? (
            <PlanItem
              key={`plan-${item.plan_id}`}
              item={item}
              onRemove={() => onRemoveService(index)}
            />
          ) : (
            <ServiceItem
              key={`service-${index}`}
              item={item}
              index={index}
              sessionTypes={sessionTypes}
              doctors={doctors}
              patientExtras={patientExtras}
              onUpdate={onUpdateService}
              onRemove={onRemoveService}
              business_type={business_type}
            />
          )
        ))}

        {/* Botón Agregar */}
        <button
          type="button"
          onClick={onAddService}
          className="w-full py-5 text-[10px] font-black text-brand-primary transition-all border-2 border-brand-secondary/20 border-dashed rounded-[2rem] hover:bg-brand-secondary/10 hover:border-brand-primary/50 flex items-center justify-center gap-3 uppercase tracking-widest group active:scale-95 shadow-sm"
        >
          <div className="bg-brand-secondary/20 text-brand-primary rounded-full p-1.5 group-hover:bg-brand-primary group-hover:text-white transition-all">
            <Plus className="w-4 h-4" />
          </div>
          {isClinical ? "Añadir Nueva Prestación" : "Añadir Nuevo Ítem"}
        </button>
      </div>
    </div>
  );
}
