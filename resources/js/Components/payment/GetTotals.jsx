import React, { useState } from "react";
import POS from "transbank-pos-sdk-web";

export default function GetTotals({ onGetTotalsResponse }) {
  const [waiting, setWaiting] = useState(false);

  const getTotals = () => {
    if (waiting) return;
    setWaiting(true);

    POS.getTotals()
      .then((response) => onGetTotalsResponse(response))
      .finally(() => setWaiting(false));
  };

  return (
    <div>
      <h2 className="text-xl">Obtener totales</h2>

      <button
        onClick={getTotals}
        className="bg-green-600 hover:bg-green-700 px-5 py-2 shadow rounded text-white"
      >
        {!waiting ? "Obtener" : "Obteniendo..."}
      </button>
    </div>
  );
}
