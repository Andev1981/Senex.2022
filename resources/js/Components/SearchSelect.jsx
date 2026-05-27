import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

const SearchSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Buscar...",
  label,
  error,
  className = "",
  config = { valueKey: 'value', displayKey: 'label', secondaryKeys: [], searchKeys: ['label'] },
  renderOption,
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const { 
    valueKey = 'value', 
    displayKey = 'label', 
    secondaryKeys = [], 
    searchKeys = ['label'] 
  } = config || {};

  const filteredOptions = useMemo(() => {
    if (!searchTerm) {
      return options;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return options.filter(option =>
      (searchKeys || []).some(key =>
        String(option[key] || '').toLowerCase().includes(lowerCaseSearchTerm)
      )
    );
  }, [options, searchTerm, searchKeys]);

  const selectedOption = useMemo(() => {
    return options.find(option => option[valueKey] == value);
  }, [options, value, valueKey]);

  useEffect(() => {
    if (selectedOption) {
      setSearchTerm(selectedOption[displayKey]);
    } else {
      setSearchTerm('');
    }
  }, [selectedOption, displayKey]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setSearchTerm(options.find(opt => opt[valueKey] == optionValue)?.[displayKey] || '');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(''); // O null, dependiendo de cómo quieras representar "sin selección"
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {label && <label className="enterprise-label ml-1 opacity-60 mb-1">{label}</label>}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray opacity-40 group-focus-within:text-brand-primary transition-colors" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-12 pr-10 py-4 rounded-2xl border-gray-100 bg-gray-100 font-black text-sm focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary shadow-inner transition-all outline-none ${disabled ? 'opacity-50 cursor-not-allowed select-none' : ''}`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-red-500 focus:outline-none p-1 rounded-full hover:bg-red-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
        </div>
      </div>
      {isOpen && !disabled && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, idx) => (
              <li
                key={`${option[valueKey]}-${idx}`}
                onClick={() => handleSelect(option[valueKey])}
                className={`cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!renderOption ? "px-4 py-3 flex flex-col" : ""}`}
              >
                {renderOption ? (
                  renderOption(option)
                ) : (
                  <>
                    <p className="font-black text-gray-900 text-sm">{option[displayKey]}</p>
                    {secondaryKeys.map(key => option[key] && (
                      <p key={key} className="text-[10px] text-gray-500 font-medium">{option[key]}</p>
                    ))}
                  </>
                )}
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-gray-500 text-sm">No hay opciones</li>
          )}
        </ul>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default SearchSelect;
