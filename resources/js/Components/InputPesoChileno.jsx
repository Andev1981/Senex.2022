const InputPesoChileno = ({
  name,
  onChange,
  className = "",
  label = "",
  error = "",
  price = 0,
}) => {
  const formatNumber = (value) => {
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

    if (onChange) {
      onChange({
        target: {
          name,
          value: numericValue ? parseInt(numericValue, 10) : "",
          type: "text",
          checked: false,
        },
      });
    }
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
        value={formatNumber(price)} // siempre se formatea desde props
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder="$0"
        className={
          "rounded-md border-primary/20 boder-[0.5] shadow-sm focus:border-primary-light focus:ring-primary-light/20 " +
          className
        }
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default InputPesoChileno;
