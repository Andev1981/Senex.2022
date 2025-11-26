import React, { useState } from "react";
import POS from "transbank-pos-sdk-web";

export default function Refund({ onRefundResponse }) {
  const [operationId, setOperationId] = useState("");
  const [waiting, setWaiting] = useState(false);

  const refund = () => {
    if (waiting) return;
    setWaiting(true);

    POS.refund(operationId)
      .then((response) => onRefundResponse(response))
      .finally(() => setWaiting(false));
  };

  return (
    <div>
      <h2 className="text-xl">Anulaciones</h2>

      <div className="flex items-center">
        <input
          type="number"
          value={operationId}
          onChange={(e) => setOperationId(e.target.value)}
          placeholder="ID de operación"
          className="border shadow rounded border-gray-600 p-1 px-2"
        />

        <button
          onClick={refund}
          className="ml-2 bg-green-600 hover:bg-green-700 px-5 py-2 shadow rounded text-white"
        >
          {!waiting ? "Anular" : "Anulando..."}
        </button>
      </div>
    </div>
  );
}
