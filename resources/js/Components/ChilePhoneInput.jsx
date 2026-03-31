// components/ChilePhoneInput.jsx
import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const ChilePhoneInput = ({
    initialValue = "",
    onChange,
    onValidationChange,
    showValidation = true,
    label = "Teléfono",
    placeholder = "+56 9 1234 5678",
    className = "",
    inputClassName = "",
    disabled = false,
    required = false,
}) => {
    const [phone, setPhone] = useState(initialValue);
    const [isValid, setIsValid] = useState(false);
    const [showMessage, setShowMessage] = useState(false);

    const validatePhone = (phoneValue) => {
        const cleanNumber = phoneValue.replace(/[^0-9]/g, "");

        if (cleanNumber.startsWith("569")) {
            return cleanNumber.length === 11;
        } else if (cleanNumber.startsWith("562")) {
            return cleanNumber.length === 11;
        } else if (cleanNumber.startsWith("9")) {
            return cleanNumber.length === 9;
        } else if (cleanNumber.startsWith("2")) {
            return cleanNumber.length === 9;
        }

        return false;
    };

    const formatPhone = (value) => {
        let cleanNumber = value.replace(/[^0-9]/g, "");

        if (!cleanNumber) return "";

        if (cleanNumber.startsWith("56")) {
            cleanNumber = cleanNumber.slice(0, 11);

            let formatted = "+56";

            if (cleanNumber.length > 2) {
                formatted += ` ${cleanNumber.slice(2, 3)}`;
            }

            if (cleanNumber.length > 3) {
                formatted += ` ${cleanNumber.slice(3, 7)}`;
            }

            if (cleanNumber.length > 7) {
                formatted += ` ${cleanNumber.slice(7)}`;
            }

            return formatted;
        } else {
            cleanNumber = cleanNumber.slice(0, 9);

            let formatted = cleanNumber.slice(0, 1);

            if (cleanNumber.length > 1) {
                formatted += ` ${cleanNumber.slice(1, 5)}`;
            }

            if (cleanNumber.length > 5) {
                formatted += ` ${cleanNumber.slice(5)}`;
            }

            return formatted;
        }
    };

    const handlePhoneChange = (e) => {
        const newValue = e.target.value;
        const formattedValue = formatPhone(newValue);
        setPhone(formattedValue);

        const isValidPhone = validatePhone(newValue);
        setIsValid(isValidPhone);
        setShowMessage(newValue.length > 0);

        onChange?.(formattedValue);
        onValidationChange?.(isValidPhone);
    };

    useEffect(() => {
        if (initialValue) {
            const formattedValue = formatPhone(initialValue);
            setPhone(formattedValue);
            setIsValid(validatePhone(initialValue));
            setShowMessage(true);
        }
    }, [initialValue]);

    const getFormatExample = () => {
        if (phone.startsWith("+56")) {
            return phone.startsWith("+56 9")
                ? "+56 9 1234 5678"
                : "+56 2 2123 4567";
        }
        return phone.startsWith("9") ? "9 1234 5678" : "2 2123 4567";
    };

    return (
        <div className="relative z-0">
            <input
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                className={
                    "rounded-md w-full pl-10 border-gray-100 border-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-primary dark:focus:ring-primary border-primary/20 boder-[0.5px] shadow-sm focus:border-primary-light focus:ring-primary-light/20  " +
                    className
                }
            />
            <div className="absolute inset-y-0 flex items-center pr-3 left-2">
                {isValid ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                )}
            </div>
        </div>
    );
};

export default ChilePhoneInput;
