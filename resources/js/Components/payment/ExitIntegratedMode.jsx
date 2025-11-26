import React, { useState } from "react";
import POS from "transbank-pos-sdk-web";

export default function ExitIntegratedMode({ onNormalModeResponse }) {
  const [waiting, setWaiting] = useState(false);

  const setNormalMode = () => {
    if (waiting) return;
    setWaiting(true);

    POS.setNormalMode()
      .then((response) => onNormalModeResponse(response))
      .finally(() => setWaiting(false));
  };

  return (
    <div>
      <h2 className="text-xl">Salir de modo integrado</h2>

      <button
        onClick={setNormalMode}
        className="bg-green-600 hover:bg-green-700 px-5 py-2 shadow rounded text-white"
      >
        {!waiting ? "Salir de modo integrado" : "Saliendo..."}
      </button>
    </div>
  );
}
