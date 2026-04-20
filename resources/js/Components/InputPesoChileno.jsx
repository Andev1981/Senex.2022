import React from "react";

const InputPesoChileno = ({
  name,
  onChange,
  className = "",
  price = 0,
  disabled = false,
  placeholder = "0"
}) => {
  
  // Función de formateo limpia: solo devuelve el string con $ si hay un número > 0
  const formatNumber = (value) => {
    const numericValue = parseInt(String(value).replace(/\D/g, ""), 10);
    if (!numericValue || isNaN(numericValue)) return "";
    
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(numericValue);
  };

  const handleChange = (e) => {
    const rawValue = e.target.value;
    const numericValue = rawValue.replace(/\D/g, "");
    
    // Notificamos al padre enviando el número puro
    onChange?.({
      target: {
        name,
        value: numericValue ? parseInt(numericValue, 10) : 0,
      },
    });
  };

  const handleFocus = (e) => {
    // Al entrar al input, movemos el cursor al final del texto para no romper el formato
    const val = e.target.value;
    e.target.setSelectionRange(val.length, val.length);
  };

  return (
    <div className="relative group">
      {/* Símbolo estático a la izquierda que NO desaparece */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-gray/40 group-focus-within:text-brand-primary font-black text-sm pointer-events-none transition-colors">
        $
      </div>
      
      <input
        type="text"
        name={name}
        // Mostramos el número formateado (sin el $ interno para evitar duplicidad) o vacío para ver placeholder
        value={price > 0 ? formatNumber(price).replace('$', '').trim() : ""}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={
          "w-full pl-10 pr-5 py-4 rounded-2xl border-gray-100 bg-gray-100 font-mono font-black text-sm focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary shadow-inner transition-all outline-none " +
          className
        }
      />
    </div>
  );
};

export default InputPesoChileno;
