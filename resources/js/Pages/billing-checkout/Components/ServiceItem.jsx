import React, { useMemo } from "react";
import EnterpriseSelect from "@/components/EnterpriseSelect";
import { Trash2, Minus, Plus, Stethoscope } from "lucide-react";

export default function ServiceItem({
  item,
  index,
  items, // Cambiado de sessionTypes a items
  doctors,
  patientExtras,
  onUpdate,
  onRemove,
  business_type = "clinical",
  agreements = [],
  coverageDetails = {},
}) {
  const isClinical = business_type === "clinical";
  const isItemEmpty = !item.item_id;
  const planId = coverageDetails?.plan_id;

  // --- LÓGICA DE TARIFAS DE CONVENIO PARA EL SELECTOR ---
  const itemOptions = useMemo(() => {
    return items.map((st) => {
      let agreementLabel = "";
      if (isClinical && planId) {
        let rule = null;
        if (Array.isArray(agreements)) {
          agreements.forEach((ag) => {
            const rulesList = ag.rules || ag.agreement_rules || [];
            
            // 1. Intentar encontrar regla específica para el Plan
            const r = rulesList.find((i) => i.plan_id == planId && i.item_id == st.id);
            if (r) {
                rule = r;
            } else {
                // 2. Si no hay por plan, buscar regla general (plan_id null) del convenio
                const gr = rulesList.find((i) => !i.plan_id && i.item_id == st.id);
                if (gr) rule = gr;
            }
          });
        }

        if (rule) {
          const copay = rule.patient_share_clp;
          agreementLabel = ` ➜ Conv: $${copay.toLocaleString("es-CL")}`;
        }
      }
      return {
        value: st.id,
        label: `${st.name} [$${st.price.toLocaleString("es-CL")}]${agreementLabel}`,
      };
    });
  }, [items, agreements, planId, isClinical]);

  // Helpers para cambio de cantidad tipo Stepper
  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdate(index, "quantity", item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    onUpdate(index, "quantity", (item.quantity || 0) + 1);
  };

  // --- LÓGICA DE PLANES (SOLO CLÍNICO) ---
  const availablePlans = isClinical ? (patientExtras.activePlans || []).filter(
    (p) => p.item_id == item.item_id && p.available > 0
  ) : [];

  // Calculamos subtotal visual para esta fila
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
      {/* 1. ENCABEZADO: TIPO DE ITEM */}
      <div className="mb-4">
        {item.is_debt ? (
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1 mb-1">
              {isClinical ? "Deuda Pendiente" : "Cargo Histórico"}
            </span>
            <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{item.name}</span>
            <span className="mt-1 font-mono text-[10px] font-bold text-gray-500">
              Registrado el: {item.date_label}
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <EnterpriseSelect
                label={isClinical ? "Prestación" : "Ítem / Servicio"}
                value={item.item_id}
                onChange={(val) => onUpdate(index, "item_id", val)}
                options={itemOptions}
                placeholder={`Seleccionar ${isClinical ? 'prestación' : 'item'}...`}
                className="bg-gray-50"
              />
            </div>

            {/* SELECTOR DE PLAN (Si aplica - SOLO CLÍNICO) */}
            {isClinical && availablePlans.length > 0 && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <label className="text-[10px] uppercase font-black text-green-600 mb-1 block tracking-widest ml-1">
                  Plan Disponible
                </label>
                <EnterpriseSelect
                  value={item.use_plan_id || ""}
                  onChange={(val) => onUpdate(index, "use_plan_id", val)}
                  options={[
                    { value: "", label: "-- No usar plan (Cobrar) --" },
                    ...availablePlans.map((p) => ({ value: p.id, label: `${p.plan_name} (${p.available} ses. disp.)` }))
                  ]}
                  className="!border-green-200 !bg-green-50"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. CUERPO: PROFESIONAL (SOLO CLÍNICO) */}
      {isClinical && (
        <div className="mb-5">
          {!item.is_debt && (
            <>
              <EnterpriseSelect
                value={item.doctor_id}
                onChange={(val) => onUpdate(index, "doctor_id", val)}
                options={doctors.map((d) => ({ value: d.id, label: `${d.name} ${d.last_name}` }))}
                placeholder="Asignar Profesional..."
                icon={Stethoscope}
              />
            </>
          )}
          {item.is_debt && (
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight pl-1 italic">
              Profesional original asignado
            </div>
          )}
        </div>
      )}

      {/* 3. FOOTER: CANTIDAD, PRECIO Y BORRAR */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        {/* A. Stepper de Cantidad */}
        <div className={`flex items-center border-2 border-gray-50 rounded-xl overflow-hidden h-10 transition-all ${isItemEmpty ? 'opacity-30 bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}>
          <button
            type="button"
            onClick={handleDecrement}
            disabled={item.is_debt || item.quantity <= 1 || isItemEmpty}
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
            disabled={item.is_debt || isItemEmpty}
            className="px-3 h-full hover:bg-gray-100 text-brand-gray disabled:opacity-30 transition-all active:scale-90"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* B. Precio y Subtotal */}
        <div className="flex flex-col items-end mr-4">
          <span className="text-[9px] font-black text-brand-gray uppercase tracking-widest opacity-60">
            {item.quantity > 1 && !isItemEmpty
              ? `${item.quantity} x $${(item.unit_price_clp || 0).toLocaleString("es-CL")}`
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
