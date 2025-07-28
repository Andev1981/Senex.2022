import { useState } from "react";

const InputPesoChileno = ({
    onChange,
    className = "",
    label = "",
    error = "",
    price = 0,
}) => {
    const [displayValue, setDisplayValue] = useState(price);

    const formatNumber = (value) => {
        // Remove non-digit characters
        const digits = value.replace(/\D/g, "");

        // Convert to number and format with dots
        if (digits) {
            const number = parseInt(digits, 10);
            return new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
                maximumFractionDigits: 0,
            }).format(number);
        }
        return "";
    };

    const handleChange = (e) => {
        const rawValue = e.target.value;
        const numericValue = rawValue.replace(/\D/g, "");
        const formattedValue = formatNumber(numericValue);

        setDisplayValue(formattedValue);

        if (onChange) {
            onChange(numericValue ? parseInt(numericValue, 10) : "");
        }
    };

    const handleFocus = (e) => {
        // Al hacer focus, mover el cursor al final
        const input = e.target;
        requestAnimationFrame(() => {
            input.selectionStart = input.selectionEnd = input.value.length;
        });
    };

    return (
        <div className="relative">
            <label className="absolute left-0 px-1 ml-1 rounded-lg text-xs text-white duration-100 ease-linear -translate-y-3 bg-[#e28930] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:ml-1 peer-focus:-translate-y-3 peer-focus:px-1 peer-focus:text-s">
                {label}
            </label>
            <input
                type="text"
                value={displayValue}
                onChange={handleChange}
                onFocus={handleFocus}
                placeholder="$0"
                className={
                    "rounded-md border-gray-100 shadow-sm focus:border-[#e28930] focus:ring-[#e28930] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-[#e28930] dark:focus:ring-[#e28930] " +
                    className
                }
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default InputPesoChileno;
