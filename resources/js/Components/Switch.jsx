import React from 'react';

export default function Switch({ className = "", label = "", checked, onChange, ...props }) {
  const uniqueId = React.useId();
  const id = props.id || uniqueId;

  // Manejo de estado controlado/no controlado
  const [internalChecked, setInternalChecked] = React.useState(props.defaultChecked || false);
  const isChecked = checked !== undefined ? checked : internalChecked;

  const handleChange = (e) => {
      setInternalChecked(e.target.checked);
      if (onChange) onChange(e);
  };

  return (
    <label htmlFor={id} className={`relative inline-flex items-center cursor-pointer group select-none ${className}`}>
      <input
        {...props}
        id={id}
        type="checkbox"
        className="sr-only peer"
        checked={isChecked}
        onChange={handleChange}
      />

      {/* Track (Fondo) */}
      <div
        className={`
          w-11 h-6 rounded-full transition-all duration-300 ease-in-out border-2
          ${isChecked 
            ? 'bg-brand-primary border-brand-primary shadow-inner' 
            : 'bg-gray-100 border-gray-200 group-hover:bg-gray-200'
          }
        `}
      ></div>

      {/* Thumb (Bolita) */}
      <div
        className={`
          absolute top-[4px] left-[4px] w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ease-spring
          ${isChecked ? 'translate-x-5' : 'translate-x-0'}
        `}
      ></div>
      
      {/* Sombra de foco externa */}
      <div className="absolute inset-0 rounded-full ring-4 ring-brand-primary/10 scale-0 peer-focus:scale-110 transition-transform opacity-0 peer-focus:opacity-100"></div>

      {label && (
        <span className={`
            ml-3 text-[10px] font-black uppercase tracking-widest transition-colors duration-300
            ${isChecked ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}
        `}>
          {label}
        </span>
      )}
    </label>
  );
}
