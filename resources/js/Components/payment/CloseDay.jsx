import POS from "transbank-pos-sdk-web";
import { useState } from "react";

export default function CloseDay({ onCloseDayResponse }) {
  const [waiting, setWaiting] = useState(false);
  const [response, setResponse] = useState(null);

  const closeDay = async () => {
    if (waiting) return;

    setWaiting(true);
    setResponse(null);

    try {
      const result = await POS.closeDay();
      if (onCloseDayResponse) {
        onCloseDayResponse(result);
      }
      setResponse(result);
    } catch (error) {
      setResponse(error.message || "Error al cerrar día");
    } finally {
      setWaiting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl">Cerrar día</h2>

      <button
        onClick={closeDay}
        className="bg-green-600 hover:bg-green-700 px-5 py-2 shadow rounded text-white"
      >
        {!waiting ? "Cerrar día" : "Cerrando día..."}
      </button>

      <pre className="mt-3 text-sm bg-gray-100 p-3 rounded">
        {response && JSON.stringify(response, null, 2)}
      </pre>
    </div>
  );
}
