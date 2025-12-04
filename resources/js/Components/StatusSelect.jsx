import React from "react";
import { TREATMENT_STATUS_OPTIONS } from "@/helpers/status";

export default function StatusSelect({
  value = "",
  onChange,
  id = "status",
  name = "status",
  required = false,
  disabled = false,
  placeholder = "Selecciona estado…",
  className = "",
}) {
  const handleChange = (e) => {
    const v = e.target.value;
    if (["active", "completed", "paused"].includes(v)) {
      onChange && onChange(v);
    }
  };

  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={handleChange}
      required={required}
      disabled={disabled}
      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300 ${className}`}
      aria-label="Estado"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {TREATMENT_STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
