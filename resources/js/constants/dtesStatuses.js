/* Estado de Dtes */
export const dtesStatuses = {
  Emitido: "bg-blue-100 text-blue-700",
  Aceptado: "bg-green-100 text-green-700",
  Rechazado: "bg-red-100 text-red-700",
  Anulado: "bg-gray-100 text-gray-700",
};

export const DTES_STATUSES = Object.entries(dtesStatuses).map(
  ([value, cfg]) => ({
    value,
    label: cfg.label,
  })
);

// Función "Helper" de búsqueda, exportada desde el mismo archivo de Constantes.
export const getStatusesConfig = (value) => {
  return (
    dtesStatuses[value] || {
      label: "Desconocido",
      text: "text-gray-600",
      badge: "bg-gray-100 text-gray-700",
    }
  );
};
