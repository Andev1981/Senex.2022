import React from "react";
import { Trash2, Minus, Plus, Stethoscope } from "lucide-react";

export default function ServiceItem({
  item,
  index,
  sessionTypes,
  doctors,
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

  // Calculamos subtotal visual para esta fila
  const subtotal = (item.unit_price_clp || 0) * (item.quantity || 1);

  return (
    <div
      className={`p-3 rounded-xl border hover:scale-[1.01] transition-transform duration-200 ${
        item.is_debt
          ? "bg-orange-50 border-orange-200"
          : "bg-white border-gray-200 shadow-sm hover:border-indigo-300"
      }`}
    >
      {/* 1. ENCABEZADO: TIPO DE PRESTACIÓN */}
      <div className="mb-2">
        {item.is_debt ? (
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-orange-600 uppercase tracking-wide flex items-center gap-1">
              Deuda Pendiente
            </span>
            <span className="text-sm font-bold text-gray-800">{item.name}</span>
            <span className="text-xs text-gray-500">
              Realizada el: {item.date_label}
            </span>
          </div>
        ) : (
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">
              Prestación
            </label>
            <select
              className="w-full text-sm font-semibold text-gray-700 border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors"
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
        )}
      </div>

      {/* 2. CUERPO: DOCTOR */}
      <div className="mb-3">
        {!item.is_debt && (
          <>
            {/* Solo mostramos label si no es deuda */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Stethoscope className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <select
                className="w-full pl-8 text-xs border-gray-200 rounded-lg bg-white text-gray-600 focus:ring-indigo-500"
                value={item.doctor_id}
                onChange={(e) => onUpdate(index, "doctor_id", e.target.value)}
              >
                <option value="">Asignar Profesional...</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        {item.is_debt && (
          <div className="text-xs text-gray-500 italic pl-1">
            Profesional original asignado
          </div>
        )}
      </div>

      {/* 3. FOOTER: CANTIDAD, PRECIO Y BORRAR */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        {/* A. Stepper de Cantidad */}
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-8">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={item.is_debt || item.quantity <= 1}
            className="px-2 h-full bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-50 transition-colors border-r border-gray-200"
          >
            <Minus className="w-3 h-3" />
          </button>
          <input
            type="number"
            className="w-10 h-full text-center text-sm font-bold border-none focus:ring-0 p-0 text-gray-700"
            value={item.quantity}
            readOnly // Para evitar que escriban letras, solo botones
          />
          <button
            type="button"
            onClick={handleIncrement}
            disabled={item.is_debt}
            className="px-2 h-full bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-50 transition-colors border-l border-gray-200"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* B. Precio y Subtotal */}
        <div className="flex flex-col items-end mr-2">
          <span className="text-xs text-gray-400 font-medium">
            {item.quantity > 1
              ? `${item.quantity} x $${item.unit_price_clp.toLocaleString(
                  "es-CL"
                )}`
              : "Valor"}
          </span>
          <span className="text-sm font-black text-indigo-600">
            ${subtotal.toLocaleString("es-CL")}
          </span>
        </div>

        {/* C. Botón Eliminar */}
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          title="Quitar ítem"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
