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
    <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl h-fit sticky top-6 hover:scale-[1.01] transition-transform duration-200">
      {/* 1. CABECERA: TÍTULO Y TOGGLE MANUAL */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
        <h2 className="text-xl font-black text-gray-800">Resumen de Caja</h2>
        <button
          type="button"
          onClick={onToggleManualMode}
          className={`text-[10px] px-2 py-1 rounded font-bold uppercase transition-colors ${
            isManualAdjustmentMode
              ? "bg-red-100 text-red-600"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {isManualAdjustmentMode
            ? "Modo Manual Activo"
            : "Activar Ajuste Manual"}
        </button>
      </div>

      {/* 2. DESGLOSE DE MONTOS */}
      <div className="space-y-3 font-mono text-sm">
        {/* Total Bruto */}
        <div className="flex justify-between items-center text-gray-600">
          <span>Total Bruto</span>
          <span className="font-bold text-gray-800 text-base">
            ${finalShares.amount_gross_clp.toLocaleString("es-CL")}
          </span>
        </div>

        {/* Descuento Particular */}
        {(!coverageDetails.insurance_id || isManualAdjustmentMode) && (
          <div className="flex justify-between items-center text-orange-600 bg-orange-50 p-2 rounded">
            <span className="font-bold text-xs uppercase">Descuento</span>
            <div className="flex items-center">
              <span className="mr-1 font-bold">-</span>
              <input
                type="number"
                className="w-20 p-1 text-right text-sm bg-white border-orange-200 rounded focus:ring-orange-500"
                value={finalShares.discount_clp}
                onChange={(e) => onManualChange("discount_clp", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Coberturas de Seguro */}
        {coverageDetails.insurance_id && (
          <div className="space-y-2 pt-2 border-t border-dashed border-gray-200">
            {/* Isapre / Fonasa */}
            <div className="flex justify-between items-center text-green-600">
              <span className="text-xs font-bold uppercase">Isapre/Fonasa</span>
              {isManualAdjustmentMode ? (
                <input
                  type="number"
                  className="w-24 p-1 text-right text-sm border-green-200 rounded focus:ring-green-500"
                  value={finalShares.amount_insurance_primary_clp}
                  onChange={(e) =>
                    onManualChange(
                      "amount_insurance_primary_clp",
                      e.target.value
                    )
                  }
                />
              ) : (
                <span>
                  -$
                  {finalShares.amount_insurance_primary_clp.toLocaleString(
                    "es-CL"
                  )}
                </span>
              )}
            </div>

            {/* Seguro Complementario */}
            {hasSecondaryInsurance && (
              <div className="flex justify-between items-center text-indigo-600">
                <span className="text-xs font-bold uppercase">
                  Seg. Complementario
                </span>
                {isManualAdjustmentMode ? (
                  <input
                    type="number"
                    className="w-24 p-1 text-right text-sm border-indigo-200 rounded focus:ring-indigo-500"
                    value={finalShares.amount_insurance_secondary_clp}
                    onChange={(e) =>
                      onManualChange(
                        "amount_insurance_secondary_clp",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <span>
                    -$
                    {finalShares.amount_insurance_secondary_clp.toLocaleString(
                      "es-CL"
                    )}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* TOTAL A PAGAR (COPAGO) */}
        <div className="pt-4 mt-4 border-t-2 border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-lg font-black text-gray-800">A PAGAR</span>
            {isManualAdjustmentMode ? (
              <input
                type="number"
                className="w-32 p-1 text-xl font-black text-right text-indigo-600 border-indigo-200 rounded bg-indigo-50 focus:ring-indigo-500"
                value={finalShares.amount_patient_clp}
                onChange={(e) =>
                  onManualChange("amount_patient_clp", e.target.value)
                }
              />
            ) : (
              <span className="text-2xl font-black text-indigo-600">
                ${finalShares.amount_patient_clp.toLocaleString("es-CL")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. ZONA DE PAGO */}
      <div className="pt-6 space-y-4">
        <div>
          <label className="block mb-2 text-xs font-black text-gray-500 uppercase">
            Método de Pago
          </label>
          <select
            className="w-full border-gray-200 rounded-lg focus:ring-indigo-500"
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
          className={`w-full py-4 text-lg font-black text-white rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 
              ${
                isProcessing || !canSubmit
                  ? "bg-gray-300 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200"
              }`}
        >
          {isProcessing
            ? "Procesando..."
            : `Cobrar $${finalShares.amount_patient_clp.toLocaleString(
                "es-CL"
              )}`}
        </button>
      </div>
    </div>
  );
}
