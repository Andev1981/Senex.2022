// src/constants/paymentStatuses.js (Recomendado)

/* Estado de los tratamientos */
export const paymentStatuses = {
  pending: {
    label: "Pendiente ⏳",
    className: "bg-blue-50 text-blue-700 border border-blue-300",
  },
  partial: {
    label: "Parcial 🟡",
    className: "bg-green-50 text-green-700 border border-green-300",
  },
  paid: {
    label: "Pagado ✅",
    className: "bg-teal-100 text-teal-800 border border-teal-400 font-semibold", // Estilo de éxito
  },
  overdue: {
    label: "Vencido 🚨",
    className: "bg-yellow-50 text-yellow-700 border border-yellow-300",
  },
  refounded: {
    label: "Reembolsado 🔄",
    className: "bg-red-50 text-red-700 border border-red-300",
  },
};

export const PAYMENT_STATUS_OPTIONS = Object.entries(paymentStatuses).map(
  ([value, cfg]) => ({ value, label: cfg.label })
);

// Función "Helper" de búsqueda, exportada desde el mismo archivo de Constantes.
export const getPaymentStatusConfig = (value) => {
  return (
    paymentStatuses[value] || {
      label: "⚪",
      className: "bg-gray-100 text-gray-500",
    }
  );
};
