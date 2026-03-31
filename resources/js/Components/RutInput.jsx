// components/RutInput.jsx
import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const RutInput = ({
    initialValue = "",
    onChange,
    onValidationChange,
    showValidation = true,
    placeholder = "12345678-9",
    className = "",
    inputClassName = "",
    disabled = false,
    required = false,
    setRutError,
}) => {
    const [rut, setRut] = useState(initialValue);
    const [isValid, setIsValid] = useState(false);
    const [showMessage, setShowMessage] = useState(false);

    const calculateVerifierDigit = (rutNumbers) => {
        const sequence = [2, 3, 4, 5, 6, 7];
        let sum = 0;
        let index = 0;

        for (let i = rutNumbers.length - 1; i >= 0; i--) {
            sum += parseInt(rutNumbers[i]) * sequence[index % 6];
            index++;
        }

        const result = 11 - (sum % 11);
        if (result === 11) return "0";
        if (result === 10) return "K";
        return result.toString();
    };

    const validateRut = (rutValue) => {
        const rutClean = rutValue.replace(/[^0-9kK]/g, "");

        if (rutClean.length < 2) return false;

        const verifier = rutClean.slice(-1).toUpperCase();
        const rutNumbers = rutClean.slice(0, -1);

        const calculatedVerifier = calculateVerifierDigit(rutNumbers);
        return calculatedVerifier === verifier;
    };

    const formatRut = (value) => {
        const rutClean = value.replace(/[^0-9kK]/g, "");

        if (rutClean.length <= 1) return rutClean;

        const dv = rutClean.slice(-1);
        let digits = rutClean.slice(0, -1);

        let result = "-" + dv;

        if (digits.length > 6) {
            const miles = digits.slice(-3);
            const millones = digits.slice(-6, -3);
            const billones = digits.slice(0, -6);

            result =
                (billones ? billones + "." : "") +
                millones +
                "." +
                miles +
                result;
        } else {
            while (digits.length > 3) {
                result = "." + digits.slice(-3) + result;
                digits = digits.slice(0, -3);
            }
            if (digits) {
                result = digits + result;
            }
        }

        return result;
    };

    const handleRutChange = (e) => {
        const newValue = e.target.value;
        const formattedValue = formatRut(newValue);
        setRut(formattedValue);

        const isValidRut = validateRut(newValue);
        setIsValid(isValidRut);
        setShowMessage(newValue.length > 0);

        if (newValue.length > 8) {
            setRutError(!isValidRut);
        } else {
            setRutError(false);
        }

        // Notificar cambios al componente padre
        onChange?.(formattedValue);
        onValidationChange?.(isValidRut);
    };

    // Validar valor inicial
    useEffect(() => {
        if (initialValue) {
            const formattedValue = formatRut(initialValue);
            setRut(formattedValue);
            setIsValid(validateRut(initialValue));
            setShowMessage(true);
        }
    }, [initialValue]);

    return (
        <div className="relative z-0">
            <input
                id="rut"
                type="text"
                value={rut}
                onChange={handleRutChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                className={
                    "rounded-md w-full pl-10 border-gray-100 shadow-sm focus:border-primary/20 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-primary dark:focus:ring-primary/20 border-[0.5px] " +
                    className
                }
                maxLength="12"
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
export default RutInput;
