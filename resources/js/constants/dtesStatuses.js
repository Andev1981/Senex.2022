/* Estado de Dtes */
export const dtesStatuses = {
  pending: {
    label: "Pendiente ⏳",
    className: "bg-gray-100 text-gray-700 border border-gray-300",
  },
  sent: {
    label: "Enviado SII 📤",
    className: "bg-blue-50 text-blue-700 border border-blue-300",
  },
  accepted: {
    label: "Aceptado ✅",
    className: "bg-green-50 text-green-700 border border-green-300",
  },
  rejected: {
    label: "Rechazado ❌",
    className: "bg-red-50 text-red-700 border border-red-300",
  },
  voided: {
    label: "Anulado 🚫",
    className: "bg-gray-200 text-gray-500 border border-gray-400 decoration-slice",
  },
  // Mapeos para compatibilidad con datos legacy si existen
  Emitido: {
    label: "Enviado",
    className: "bg-blue-50 text-blue-700",
  },
  Aceptado: {
    label: "Aceptado",
    className: "bg-green-50 text-green-700",
  },
  Rechazado: {
    label: "Rechazado",
    className: "bg-red-50 text-red-700",
  },
  Anulado: {
    label: "Anulado",
    className: "bg-gray-200 text-gray-600",
  },
};

export const DTES_STATUSES = dtesStatuses;

export const getDteStatusConfig = (value) => {
  // Normalizar a minúsculas si es necesario o manejar fallbacks
  const status = dtesStatuses[value] || dtesStatuses[value?.toLowerCase()];
  return (
    status || {
      label: value || "Desconocido",
      className: "bg-gray-100 text-gray-600",
    }
  );
};
