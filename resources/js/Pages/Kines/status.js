// status.js
export const STATUS_MAP = {
  0: { label: "Pendiente de atención", chip: "bg-yellow-100 text-yellow-800" },
  1: { label: "Atendido", chip: "bg-green-100 text-green-800" },
  2: { label: "Cancelado", chip: "bg-red-100 text-red-800" },
  3: { label: "Reagendado", chip: "bg-blue-100 text-blue-800" },
};

export const STATUS_OPTIONS = [
  { value: 0, label: STATUS_MAP[0].label },
  { value: 1, label: STATUS_MAP[1].label },
  { value: 2, label: STATUS_MAP[2].label },
  { value: 3, label: STATUS_MAP[3].label },
];
