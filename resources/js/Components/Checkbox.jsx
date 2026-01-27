import React from 'react';
import { Check } from 'lucide-react';

export default function Checkbox({ className = "", label, checked, onChange, ...props }) {
    // Manejo interno para cuando no se pasa checked/onChange explícitamente (uncontrolled)
    const [internalChecked, setInternalChecked] = React.useState(props.defaultChecked || false);
    const isChecked = checked !== undefined ? checked : internalChecked;

    const handleChange = (e) => {
        setInternalChecked(e.target.checked);
        if (onChange) onChange(e);
    };

    return (
        <label className={`inline-flex items-center gap-3 cursor-pointer group select-none ${className}`}>
            <div className="relative flex items-center justify-center">
                <input
                    {...props}
                    type="checkbox"
                    className="sr-only peer" // Ocultamos el input nativo feo
                    checked={isChecked}
                    onChange={handleChange}
                />
                
                {/* La caja visual personalizada */}
                <div className={`
                    w-6 h-6 rounded-xl border-2 transition-all duration-300 ease-out flex items-center justify-center
                    ${isChecked 
                        ? 'bg-brand-primary border-brand-primary shadow-lg shadow-brand-primary/30 scale-100' 
                        : 'bg-white border-gray-200 hover:border-brand-primary/50 hover:bg-gray-50'
                    }
                `}>
                    <Check 
                        className={`
                            w-3.5 h-3.5 text-white transition-all duration-300
                            ${isChecked ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}
                        `} 
                        strokeWidth={4}
                    />
                </div>

                {/* Efecto de anillo al enfocar (accesibilidad bonita) */}
                <div className="absolute inset-0 rounded-xl bg-brand-primary/20 scale-0 peer-focus:scale-150 transition-transform duration-300 opacity-0 peer-focus:opacity-100 -z-10"></div>
            </div>

            {label && (
                <span className={`
                    text-[10px] font-black uppercase tracking-widest transition-colors duration-300
                    ${isChecked ? 'text-brand-primary' : 'text-gray-400 group-hover:text-gray-600'}
                `}>
                    {label}
                </span>
            )}
        </label>
    );
}
