import { DollarSign } from "lucide-react";

const InputPesoChileno = ({
  name,
  onChange,
  className = "",
  price = 0,
  disabled = false,
}) => {
  const formatNumber = (value) => {
    // Si ya viene formateado, no lo toques
    if (typeof value === "string" && value.includes("$")) return value;

    const digits = String(value).replace(/\D/g, "");
    if (digits) {
      return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      }).format(parseInt(digits, 10));
    }
    return "";
  };

  const handleChange = (e) => {
    const rawValue = e.target.value;
    const numericValue = rawValue.replace(/\D/g, "");

    onChange?.({
      target: {
        name,
        value: numericValue ? parseInt(numericValue, 10) : "",
      },
    });
  };

  const handleFocus = (e) => {
    requestAnimationFrame(() => {
      e.target.selectionStart = e.target.selectionEnd = e.target.value.length;
    });
  };

  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray opacity-40">
        <DollarSign className="w-4 h-4" />
      </div>
      <input
        type="text"
        name={name}
        value={formatNumber(price)}
        onChange={handleChange}
        onFocus={handleFocus}
        disabled={disabled}
        className={
          "w-full pl-12 pr-4 py-4 rounded-2xl border-gray-100 bg-gray-100 font-mono font-black text-sm focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary shadow-inner transition-all outline-none " +
          className
        }
      />
    </div>
  );
};

export default InputPesoChileno;
