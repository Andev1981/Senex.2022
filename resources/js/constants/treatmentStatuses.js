// src/constants/treatmentStatuses.js (Recomendado)

/* Estado de los tratamientos */
export const treatmentStatuses = {
  evaluation: {
    label: "Evaluación 📝",
    className: "bg-blue-50 text-blue-700 border border-blue-300",
  },
  in_progress: {
    label: "En Progreso ⏳",
    className: "bg-green-50 text-green-700 border border-green-300",
  },
  completed: {
    label: "Completado ✅",
    className: "bg-teal-100 text-teal-800 border border-teal-400 font-semibold", // Estilo de éxito
  },
  paused: {
    label: "Pausado ⏸️",
    className: "bg-yellow-50 text-yellow-700 border border-yellow-300",
  },
  cancelled: {
    label: "Cancelado ❌",
    className: "bg-red-50 text-red-700 border border-red-300",
  },
};

export const TREATMENT_STATUS_OPTIONS = Object.entries(treatmentStatuses).map(
  ([value, cfg]) => ({ value, label: cfg.label })
);

// Función "Helper" de búsqueda, exportada desde el mismo archivo de Constantes.
export const getStatusConfig = (value) => {
  return (
    treatmentStatuses[value] || {
      label: "Desconocido ⚪",
      className: "bg-gray-100 text-gray-500",
    }
  );
};
