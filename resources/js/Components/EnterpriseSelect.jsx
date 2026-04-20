import React from 'react';
import { ChevronDown } from 'lucide-react';

const EnterpriseSelect = ({
    label,
    value,
    onChange,
    options = [],
    placeholder = "-- Seleccionar --",
    disabled = false,
    className = "",
    error = null,
    required = false,
    icon: Icon = null, // Soporte para icono opcional
}) => {
    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <label className="enterprise-label ml-1 opacity-60">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            
            <div className="relative group">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-brand-primary transition-colors">
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                
                <select
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    required={required}
                    className={`
                        w-full appearance-none pr-12 py-4 
                        rounded-2xl border-gray-100 bg-gray-100 
                        font-black text-xs uppercase tracking-tight
                        focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary 
                        shadow-inner transition-all outline-none cursor-pointer
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${Icon ? 'pl-12' : 'pl-6'} 
                        ${error ? 'border-red-500 ring-red-100' : ''}
                    `}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-brand-primary transition-colors">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>

            {error && <p className="mt-1 text-[10px] font-black uppercase text-red-600 ml-2 tracking-widest">{error}</p>}
        </div>
    );
};

export default EnterpriseSelect;
