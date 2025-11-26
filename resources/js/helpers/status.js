import { AlertCircle, CheckCircle } from "lucide-react";

// status.js
export const STATUS_MAP = {
  pending: { label: "Pendiente", chip: "bg-yellow-100 text-yellow-800" },
  completed: { label: "Completado", chip: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelado", chip: "bg-red-100 text-red-800" },
  rescheduled: { label: "Reagendado", chip: "bg-blue-100 text-blue-800" },
  scheduled: { label: "Agendado", chip: "bg-purple-100 text-purple-800" },
};

export const statusPill = (isActive) =>
  isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700";

export const meses = [
  { name: "Enero", value: 1 },
  { name: "Febrero", value: 2 },
  { name: "Marzo", value: 3 },
  { name: "Abril", value: 4 },
  { name: "Mayo", value: 5 },
  { name: "Junio", value: 6 },
  { name: "Julio", value: 7 },
  { name: "Agosto", value: 8 },
  { name: "Septiembre", value: 9 },
  { name: "Octubre", value: 10 },
  { name: "Noviembre", value: 11 },
  { name: "Diciembre", value: 12 },
];

export const patientStatuses = {
  active: {
    label: "Activo",
    className: "bg-green-400",
  },
  inactive: {
    label: "Inactivo",
    className: "bg-gray-400",
  },
  suspended: {
    label: "Suspendido",
    className: "bg-yellow-300",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-red-400",
  },
};

export const generes = {
  male: {
    label: "Masculino",
    className: "bg-blue-500",
  },
  female: {
    label: "Femenino",
    className: "bg-pink-500",
  },
  other: {
    label: "Otro",
    className: "bg-purple-500",
  },
};

export const treatmentStatuses = {
  active: {
    label: "Activo",
    className: "bg-green-500 text-white border border-green-600",
  },
  completed: {
    label: "Completado",
    className: "bg-blue-500 text-white border border-blue-600",
  },
  paused: {
    label: "Pausado",
    className: "bg-yellow-500 text-white border border-yellow-600",
  },
};

export const debtStatuses = {
  ok: {
    label: "Al día",
    className: "bg-emerald-500 text-white border border-emerald-600",
  },
  due: {
    label: "Con deuda",
    className: "bg-amber-500 text-white border border-amber-600",
  },
  overdue: {
    label: "Vencida",
    className: "bg-red-500 text-white border border-red-600",
  },
};

export const DEBT_STATUS_OPTIONS = Object.entries(debtStatuses).map(
  ([value, cfg]) => ({ value, label: cfg.label })
);

export const PATIENT_STATUS_OPTIONS = Object.entries(patientStatuses).map(
  ([value, cfg]) => ({ value, label: cfg.label })
);

export const TREATMENT_STATUS_OPTIONS = Object.entries(treatmentStatuses).map(
  ([value, cfg]) => ({ value, label: cfg.label })
);

export const PATIENT_STATUS_TRANSITIONS = {
  active: ["suspended", "cancelled"],
  suspended: ["active", "cancelled"],
  cancelled: [],
};

export const paymentMethods = [
  { value: "cash", label: "Efectivo", icon: "💵" },
  { value: "transfer", label: "Transferencia", icon: "🏦" },
  { value: "webpay_debit", label: "Tarjeta de Débito", icon: "💳" },
  { value: "webpay_credit", label: "Tarjeta de Crédito", icon: "💳" },
  { value: "paycheck", label: "Cheque", icon: "📝" },
  { value: "other", label: "Otro", icon: "💰" },
];

export const statusOptions = [
  {
    value: "completed",
    label: "Completado",
    color: "green",
    icon: CheckCircle,
  },
  {
    value: "pending",
    label: "Pendiente",
    color: "yellow",
    icon: AlertCircle,
  },
  { value: "failed", label: "Rechazado", color: "red", icon: AlertCircle },
  { value: "refunded", label: "Reembolso", color: "red", icon: AlertCircle },
];

export const estadoClass = (estado) => {
  switch (estado) {
    case "completed":
      return "bg-green-100 text-green-700";
    case "in_progress":
      return "bg-blue-100 text-blue-700";
    case "scheduled":
      return "bg-amber-100 text-amber-700";
    case "cancelled":
      return "bg-gray-200 text-gray-700";
    case "absent":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const estadoTexto = (estado) => {
  switch (estado) {
    case "completed":
      return "Completada";
    case "in_progress":
      return "En Curso";
    case "scheduled":
      return "Programada";
    case "cancelled":
      return "Cancelada";
    case "absent":
      return "Ausente";
    default:
      return estado;
  }
};

export const tipoClass = (tipo) => {
  switch (tipo) {
    case "evaluacion":
      return "bg-purple-100 text-purple-700";
    case "control":
      return "bg-cyan-100 text-cyan-700";
    case "sesion":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};
