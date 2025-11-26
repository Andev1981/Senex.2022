import React, { useState } from "react";
import POS from "transbank-pos-sdk-web";

export default function LoadKeys({ onLoadKeyResponse }) {
  const [waiting, setWaiting] = useState(false);

  const loadKeys = () => {
    if (waiting) return;

    setWaiting(true);

    POS.getKeys()
      .then((response) => onLoadKeyResponse(response))
      .finally(() => setWaiting(false));
  };

  return (
    <div>
      <h2 className="text-xl">Carga de llaves</h2>

      <button
        onClick={loadKeys}
        className="bg-green-600 hover:bg-green-700 px-5 py-2 shadow rounded text-white"
      >
        {waiting ? "Cargando llaves..." : "Carga de llaves"}
      </button>
    </div>
  );
}
