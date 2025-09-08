import React from "react";
import { Head } from "@inertiajs/react";

export default function Result({ ok, commit, message }) {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Head title="Resultado Pago" />
      <h1 className="text-2xl font-semibold mb-4">Resultado del pago</h1>
      {!ok && (
        <div className="text-red-600">{message || "Transacción rechazada"}</div>
      )}
      {ok && <div className="text-green-700">¡Pago autorizado!</div>}
      {commit && (
        <pre className="mt-4 bg-gray-100 p-3 rounded text-sm overflow-auto">
          {JSON.stringify(commit, null, 2)}
        </pre>
      )}
    </div>
  );
}
