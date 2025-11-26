import React, { useState } from "react";
import POS from "transbank-pos-sdk-web";

export default function GetLastSale({ onLastSaleResponse }) {
  const [waiting, setWaiting] = useState(false);

  const getLastSale = () => {
    if (waiting) return;

    setWaiting(true);

    POS.getLastSale()
      .then((response) => onLastSaleResponse(response))
      .finally(() => setWaiting(false));
  };

  return (
    <div>
      <h2 className="text-xl">Recuperar última venta</h2>
      <button
        onClick={getLastSale}
        className="bg-green-600 hover:bg-green-700 px-5 py-2 shadow rounded text-white"
      >
        {!waiting ? "Recuperar" : "Obteniendo..."}
      </button>
    </div>
  );
}
