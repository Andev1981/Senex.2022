export const translations = {
  contactType: {
    emergency: "Emergencia",
    guardian: "Apoderado",
    other: "Otro",
  },
  gender: {
    male: "Masculino",
    female: "Femenino",
    other: "Otro",
    unknown: "Desconocido",
  },
  maritalStatus: {
    single: "Soltero/a",
    married: "Casado/a",
    divorced: "Divorciado/a",
    widowed: "Viudo/a",
    cohabiting: "Conviviente",
  },
  sessionStatus: {
    scheduled: "Programada",
    completed: "Completada",
    canceled: "Cancelada",
    no_show: "No Asistió",
  },
  paymentStatus: {
    pending: "Pendiente",
    paid: "Pagado",
    overdue: "Vencido",
  },
  doctorStatus: {
    active: "Activo",
    inactive: "Inactivo",
    suspended: "Suspendido",
    cancelled: "Cancelado",
  },
  // ... más
};

export function t(category, key) {
  return translations[category]?.[key] ?? key;
}
