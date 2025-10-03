// components/ChilePhoneInput.jsx
import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const ChilePhoneInput = ({
  name = "phone",
  value = "", // ← CONTROLADO (desde el form)
  onChange, // ← devuelve E.164 (+569XXXXXXXX)
  onValidationChange,
  showValidation = true,
  label = "Teléfono",
  placeholder = "+56 9 1234 5678",
  className = "",
  inputClassName = "",
  disabled = false,
  required = false,
  error,
}) => {
  const [display, setDisplay] = useState(""); // solo para mostrar bonito

  // --- helpers ---
  const digits = (s) => String(s || "").replace(/\D/g, "");

  // válido si: +56 + 9 dígitos (móvil/fijo) o local 9 dígitos
  const isValid = (raw) => {
    const d = digits(raw);
    if (d.startsWith("56") && d.length === 11) return true; // 56 + 9 dígitos
    if ((d.startsWith("9") || d.startsWith("2")) && d.length === 9) return true; // local
    return false;
  };

  // convierte a E.164 chileno si es posible
  const toE164 = (raw) => {
    const d = digits(raw);
    if (!d) return "";
    if (d.startsWith("56")) return `+${d.slice(0, 11)}`;
    if ((d.startsWith("9") || d.startsWith("2")) && d.length === 9)
      return `+56${d}`;
    return `+${d}`; // fallback
  };

  // formatea para mostrar
  const formatPretty = (raw) => {
    const d = digits(raw);
    if (!d) return "";

    if (d.startsWith("56")) {
      const base = d.slice(0, 11); // 56 + (9|2) + 8 dígitos
      const a = base.slice(2, 3); // 9 o 2
      const b = base.slice(3, 7); // XXXX
      const c = base.slice(7, 11); // XXXX
      return `+56${a ? " " + a : ""}${b ? " " + b : ""}${
        c ? " " + c : ""
      }`.trim();
    }

    // local sin +56
    const base = d.slice(0, 9);
    const a = base.slice(0, 1); // 9 o 2
    const b = base.slice(1, 5); // XXXX
    const c = base.slice(5, 9); // XXXX
    return `${a}${b ? " " + b : ""}${c ? " " + c : ""}`.trim();
  };

  // sincroniza la vista con el value del padre
  useEffect(() => {
    setDisplay(formatPretty(value));
    onValidationChange?.(isValid(value));
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    setDisplay(formatPretty(raw));

    const ok = isValid(raw);
    onValidationChange?.(ok);
    onChange?.(toE164(raw)); // ← envía al form el E.164
  };

  return (
    <div className={"relative z-0 " + className}>
      <input
        id={name}
        name={name}
        type="tel"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={
          "w-full rounded-md pl-10 border-[0.5px] border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-200 " +
          inputClassName
        }
      />
      <div className="absolute inset-y-0 flex items-center pr-3 left-2">
        {isValid(display) ? (
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        ) : (
          <AlertCircle className="w-4 h-4 text-gray-500" />
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default ChilePhoneInput;
