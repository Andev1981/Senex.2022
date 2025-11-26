import React, { useState } from "react";
import POS from "transbank-pos-sdk-web";

export default function GetDaySales({ onGetSales }) {
  const [printOnPos, setPrintOnPos] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const getDetails = () => {
    if (waiting) return;

    setWaiting(true);

    POS.getDetails(printOnPos)
      .then((response) => {
        onGetSales(response);
      })
      .finally(() => setWaiting(false));
  };

  return (
    <div>
      <h2 className="text-xl">Obtener ventas del día</h2>

      <label htmlFor="printOnPos">
        <input
          id="printOnPos"
          type="checkbox"
          checked={printOnPos}
          onChange={() => setPrintOnPos(!printOnPos)}
        />{" "}
        Imprimir en el POS
      </label>

      <hr className="m-2" />

      <button
        onClick={getDetails}
        className="bg-green-600 hover:bg-green-700 px-5 py-2 shadow rounded text-white"
      >
        {!waiting ? "Obtener ventas del día" : "Obteniendo..."}
      </button>
    </div>
  );
}
