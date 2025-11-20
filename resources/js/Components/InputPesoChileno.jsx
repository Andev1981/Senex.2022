const InputPesoChileno = ({
  name,
  onChange,
  className = "",
  label = "",
  error = "",
  price = 0,
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
      <input
        type="text"
        value={formatNumber(price)}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder="$0"
        className={
          "rounded-md border-primary/20 border-[0.5] shadow-sm focus:border-primary-light focus:ring-primary-light/20 " +
          className
        }
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default InputPesoChileno;
