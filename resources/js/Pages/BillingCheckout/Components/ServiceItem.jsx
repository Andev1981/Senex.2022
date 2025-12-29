import React from "react";
import { Trash2, Minus, Plus, Stethoscope } from "lucide-react";

export default function ServiceItem({
  item,
  index,
  sessionTypes,
  doctors,
  patientExtras,
  onUpdate,
  onRemove,
}) {
  // Helpers para cambio de cantidad tipo Stepper
  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdate(index, "quantity", item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    onUpdate(index, "quantity", (item.quantity || 0) + 1);
  };

  // --- LÓGICA DE PLANES ---
  // Buscamos si hay planes que cubran esta prestación específica
  const availablePlans = (patientExtras.activePlans || []).filter(
    (p) => p.session_type_id == item.session_type_id && p.available > 0
  );

  // Calculamos subtotal visual para esta fila
  // Si usa plan, el costo para el paciente es 0
  const subtotal = item.use_plan_id 
    ? 0 
    : (item.unit_price_clp || 0) * (item.quantity || 1);

  return (
    <div
      className={`p-5 rounded-2xl border-2 hover:scale-[1.01] transition-all duration-300 ${
        item.is_debt
          ? "bg-orange-50/50 border-orange-100"
          : item.use_plan_id
          ? "bg-green-50/50 border-green-200 shadow-md shadow-green-500/5"
          : "bg-white border-gray-100 shadow-sm hover:border-brand-secondary/50"
      }`}
    >
      {/* 1. ENCABEZADO: TIPO DE PRESTACIÓN */}
      <div className="mb-4">
        {item.is_debt ? (
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1 mb-1">
              Deuda Pendiente
            </span>
            <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{item.name}</span>
            <span className="mt-1 font-mono text-[10px] font-bold text-gray-500">
              Realizada el: {item.date_label}
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="enterprise-label ml-1">
                Prestación
              </label>
              <select
                className="w-full text-sm font-bold text-gray-700 border-gray-100 rounded-xl focus:ring-brand-primary focus:border-brand-primary bg-gray-50 focus:bg-white transition-all"
                value={item.session_type_id}
                onChange={(e) =>
                  onUpdate(index, "session_type_id", e.target.value)
                }
              >
                <option value="">Seleccionar prestación...</option>
                {sessionTypes.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SELECTOR DE PLAN (Si aplica) */}
            {availablePlans.length > 0 && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <label className="text-[10px] uppercase font-black text-green-600 mb-1 block tracking-widest">
                  Plan Disponible
                </label>
                <select
                  className="w-full text-[11px] font-black text-green-700 border-green-200 rounded-xl bg-green-50 focus:ring-green-500 transition-all uppercase tracking-tight"
                  value={item.use_plan_id || ""}
                  onChange={(e) => onUpdate(index, "use_plan_id", e.target.value)}
                >
                  <option value="">-- No usar plan (Cobrar) --</option>
                  {availablePlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.plan_name} ({p.available} ses. disp.)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. CUERPO: DOCTOR */}
      <div className="mb-5">
        {!item.is_debt && (
          <>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Stethoscope className="h-4 w-4 text-brand-gray opacity-50" />
              </div>
              <select
                className="w-full pl-10 text-xs font-bold border-gray-100 rounded-xl bg-white text-gray-600 focus:ring-brand-primary transition-all"
                value={item.doctor_id}
                onChange={(e) => onUpdate(index, "doctor_id", e.target.value)}
              >
                <option value="">Asignar Profesional...</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.last_name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        {item.is_debt && (
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight pl-1 italic">
            Profesional original asignado
          </div>
        )}
      </div>

      {/* 3. FOOTER: CANTIDAD, PRECIO Y BORRAR */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        {/* A. Stepper de Cantidad */}
        <div className="flex items-center border-2 border-gray-50 rounded-xl overflow-hidden h-10 bg-gray-50">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={item.is_debt || item.quantity <= 1}
            className="px-3 h-full hover:bg-gray-100 text-brand-gray disabled:opacity-30 transition-all active:scale-90"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <input
            type="number"
            className="w-10 h-full text-center text-sm font-black border-none focus:ring-0 p-0 text-gray-900 bg-transparent"
            value={item.quantity}
            readOnly 
          />
          <button
            type="button"
            onClick={handleIncrement}
            disabled={item.is_debt}
            className="px-3 h-full hover:bg-gray-100 text-brand-gray disabled:opacity-30 transition-all active:scale-90"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* B. Precio y Subtotal */}
        <div className="flex flex-col items-end mr-4">
          <span className="text-[9px] font-black text-brand-gray uppercase tracking-widest opacity-60">
            {item.quantity > 1
              ? `${item.quantity} x $${item.unit_price_clp.toLocaleString(
                  "es-CL"
                )}`
              : "Valor Item"}
          </span>
          <span className={`text-lg font-black font-mono ${item.use_plan_id ? 'text-green-600' : 'text-brand-primary'}`}>
            ${subtotal.toLocaleString("es-CL")}
          </span>
        </div>

        {/* C. Botón Eliminar */}
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-95 border-2 border-transparent hover:border-red-100"
          title="Quitar ítem"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
