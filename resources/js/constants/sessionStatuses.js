// src/constants/sessionStatuses.js (Recomendado)

/* Estado de los sesiones */
export const sessionStatuses = {
  scheduled: {
    label: "Programada 📅",
    className: "bg-blue-50 text-blue-700 border border-blue-300",
  },
  in_progress: {
    label: "En Progreso ▶️",
    className: "bg-green-50 text-green-700 border border-green-300",
  },
  completed: {
    label: "Completada ✅",
    className: "bg-teal-100 text-teal-800 border border-teal-400 font-semibold", // Estilo de éxito
  },
  cancelled: {
    label: "Cancelada 🚫",
    className: "bg-yellow-50 text-yellow-700 border border-yellow-300",
  },
  not_attend: {
    label: "Ausente 🚶",
    className: "bg-red-50 text-red-700 border border-red-300",
  },
};

export const SESSION_STATUS_OPTIONS = Object.entries(sessionStatuses).map(
  ([value, cfg]) => ({ value, label: cfg.label })
);

// Función "Helper" de búsqueda, exportada desde el mismo archivo de Constantes.
export const getSessionStatusConfig = (value) => {
  return (
    sessionStatuses[value] || {
      label: "Desconocido ⚪",
      className: "bg-gray-100 text-gray-500",
    }
  );
};
