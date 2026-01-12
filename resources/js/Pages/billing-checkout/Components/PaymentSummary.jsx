import React from "react";

export default function PaymentSummary({
  finalShares,
  paymentDetails,
  coverageDetails,
  isManualAdjustmentMode,
  hasSecondaryInsurance,
  paymentMethods,
  isProcessing,
  canSubmit,
  onToggleManualMode,
  onManualChange,
  onPaymentMethodChange,
}) {
  return (
    <div className="p-8 bg-white border border-gray-100 shadow-xl rounded-[2.5rem] h-fit sticky top-6 hover:scale-[1.01] transition-all duration-300">
      {/* 1. CABECERA: TÍTULO Y TOGGLE MANUAL */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-50 mb-6">
        <h2 className="text-xl font-black text-gray-800 tracking-tight text-center">Resumen de Caja</h2>
        <button
          type="button"
          onClick={onToggleManualMode}
          className={`text-[9px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest transition-all shadow-sm ${
            isManualAdjustmentMode
              ? "bg-red-500 text-white shadow-red-200"
              : "bg-gray-100 text-brand-gray hover:bg-gray-200"
          }`}
        >
          {isManualAdjustmentMode
            ? "Manual ON"
            : "Ajuste Manual"}
        </button>
      </div>

      {/* 2. DESGLOSE DE MONTOS */}
      <div className="space-y-4 font-mono">
        {/* Total Bruto */}
        <div className="flex justify-between items-center text-brand-gray">
          <span className="enterprise-label !mb-0">Total Bruto</span>
          <span className="font-black text-gray-900 text-lg">
            ${finalShares.amount_gross_clp.toLocaleString("es-CL")}
          </span>
        </div>

        {/* Descuento Particular */}
        {(!coverageDetails.insurance_id || isManualAdjustmentMode) && (
          <div className="flex justify-between items-center text-orange-600 bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
            <span className="enterprise-label !mb-0 !text-orange-600">Descuento</span>
            <div className="flex items-center gap-2">
              <span className="font-black">-</span>
              <input
                type="number"
                className="w-24 p-2 text-right text-sm font-black bg-white border-orange-200 rounded-xl focus:ring-orange-500 text-orange-700 shadow-sm"
                value={finalShares.discount_clp}
                onChange={(e) => onManualChange("discount_clp", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Coberturas de Seguro */}
        {coverageDetails.insurance_id && (
          <div className="space-y-3 pt-4 border-t-2 border-dashed border-gray-100">
            {/* Isapre / Fonasa */}
            <div className="flex justify-between items-center">
              <span className="enterprise-label !mb-0 !text-green-600">Isapre/Fonasa</span>
              {isManualAdjustmentMode ? (
                <div className="flex items-center gap-2">
                    <span className="text-green-600 font-black">-</span>
                    <input
                    type="number"
                    className="w-28 p-2 text-right text-sm font-black border-green-200 rounded-xl focus:ring-green-500 bg-green-50/30 text-green-700 shadow-sm"
                    value={finalShares.amount_insurance_primary_clp}
                    onChange={(e) =>
                        onManualChange(
                        "amount_insurance_primary_clp",
                        e.target.value
                        )
                    }
                    />
                </div>
              ) : (
                <span className="font-black text-green-600 text-base">
                  -${finalShares.amount_insurance_primary_clp.toLocaleString(
                    "es-CL"
                  )}
                </span>
              )}
            </div>

            {/* Seguro Complementario */}
            {hasSecondaryInsurance && (
              <div className="flex justify-between items-center">
                <span className="enterprise-label !mb-0 !text-brand-primary">Seg. Compl.</span>
                {isManualAdjustmentMode ? (
                  <div className="flex items-center gap-2">
                    <span className="text-brand-primary font-black">-</span>
                    <input
                        type="number"
                        className="w-28 p-2 text-right text-sm font-black border-brand-secondary/30 rounded-xl focus:ring-brand-primary bg-brand-secondary/5 text-brand-primary shadow-sm"
                        value={finalShares.amount_insurance_secondary_clp}
                        onChange={(e) =>
                        onManualChange(
                            "amount_insurance_secondary_clp",
                            e.target.value
                        )
                        }
                    />
                  </div>
                ) : (
                  <span className="font-black text-brand-primary text-base">
                    -${finalShares.amount_insurance_secondary_clp.toLocaleString(
                      "es-CL"
                    )}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* TOTAL A PAGAR (COPAGO) */}
        <div className="pt-6 mt-6 border-t-4 border-gray-50">
          <div className="flex flex-col gap-2">
            <span className="enterprise-label text-center !text-xs !mb-0">Monto Final a Recaudar</span>
            {isManualAdjustmentMode ? (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-brand-primary text-xl">$</span>
                <input
                    type="number"
                    className="w-full pl-8 pr-4 py-4 text-2xl font-black text-right text-brand-primary border-brand-primary/20 rounded-2xl bg-brand-secondary/5 focus:ring-brand-primary shadow-inner"
                    value={finalShares.amount_patient_clp}
                    onChange={(e) =>
                    onManualChange("amount_patient_clp", e.target.value)
                    }
                />
              </div>
            ) : (
              <span className="text-4xl font-black text-brand-primary text-center tracking-tighter drop-shadow-sm">
                ${finalShares.amount_patient_clp.toLocaleString("es-CL")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. ZONA DE PAGO */}
      <div className="pt-10 space-y-5">
        <div>
          <label className="enterprise-label ml-1">
            Método de Pago
          </label>
          <select
            className="w-full py-4 px-4 font-bold text-gray-700 border-gray-100 rounded-2xl focus:ring-brand-primary bg-gray-50/50 transition-all cursor-pointer"
            value={paymentDetails.payment_method}
            onChange={(e) => onPaymentMethodChange(e.target.value)}
          >
            {paymentMethods.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isProcessing || !canSubmit}
          className={`w-full py-5 text-base font-black text-white rounded-[2rem] shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest
              ${
                isProcessing || !canSubmit
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed shadow-none"
                  : "bg-brand-primary hover:brightness-110 shadow-brand-primary/25"
              }`}
        >
          {isProcessing
            ? "Procesando..."
            : "Confirmar y Cobrar"}
        </button>
        
        <p className="text-[10px] text-center text-brand-gray font-bold uppercase tracking-tighter opacity-50">
            Transacción Segura y Encriptada
        </p>
      </div>
    </div>
  );
}
