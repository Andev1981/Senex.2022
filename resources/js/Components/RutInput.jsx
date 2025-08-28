// components/RutInput.jsx
import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Building2, Search } from "lucide-react";

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
    tipoDocumento = null, // Para saber si es factura
    onEmpresaEncontrada = null, // Callback cuando se encuentra una empresa
    empresasExistentes = [], // Lista de empresas en BD local
}) => {
    const [rut, setRut] = useState(initialValue);
    const [isValid, setIsValid] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [empresaEncontrada, setEmpresaEncontrada] = useState(null);
    const [isConsulting, setIsConsulting] = useState(false);

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

    // Validación específica para empresas (RUTs de 8-9 dígitos)
    const validateRutEmpresarial = (rutValue) => {
        if (!validateRut(rutValue)) return false;
        
        const rutClean = rutValue.replace(/[^0-9kK]/g, "");
        const rutNumbers = rutClean.slice(0, -1);
        
        // RUTs empresariales típicamente tienen 7-8 dígitos (sin DV)
        return rutNumbers.length >= 7 && rutNumbers.length <= 8;
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

    // Buscar empresa en la base de datos local
    const buscarEmpresaLocal = (rut) => {
        const empresa = empresasExistentes.find(emp => 
            emp.rut.replace(/[.-]/g, '') === rut.replace(/[.-]/g, '')
        );
        return empresa || null;
    };

    // Consultar empresa (simulación de API del SII)
    const consultarEmpresa = async (rut) => {
        if (!validateRutEmpresarial(rut)) return null;
        
        setIsConsulting(true);
        
        try {
            // Primero buscar en BD local
            const empresaLocal = buscarEmpresaLocal(rut);
            if (empresaLocal) {
                setEmpresaEncontrada(empresaLocal);
                onEmpresaEncontrada?.(empresaLocal);
                return empresaLocal;
            }

            // Simular consulta al SII (aquí puedes integrar la API real)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Por ahora retornamos null, pero aquí iría la lógica de la API del SII
            return null;
        } catch (error) {
            console.error('Error consultando empresa:', error);
            return null;
        } finally {
            setIsConsulting(false);
        }
    };

    const handleRutChange = (e) => {
        const newValue = e.target.value;
        const formattedValue = formatRut(newValue);
        setRut(formattedValue);

        const isValidRut = validateRut(newValue);
        const isValidEmpresarial = tipoDocumento && [33, 34, 43, 46, 56, 61].includes(tipoDocumento) 
            ? validateRutEmpresarial(newValue) 
            : true;
        
        setIsValid(isValidRut && isValidEmpresarial);
        setShowMessage(newValue.length > 0);

        // Limpiar empresa encontrada si cambia el RUT
        if (empresaEncontrada && empresaEncontrada.rut !== formattedValue) {
            setEmpresaEncontrada(null);
        }

        if (newValue.length > 8) {
            setRutError(!isValidRut || !isValidEmpresarial);
        } else {
            setRutError(false);
        }

        // Notificar cambios al componente padre
        onChange?.(formattedValue);
        onValidationChange?.(isValidRut && isValidEmpresarial);
    };

    const handleConsultarEmpresa = () => {
        if (rut && validateRutEmpresarial(rut)) {
            consultarEmpresa(rut);
        }
    };

    // Validar valor inicial
    useEffect(() => {
        if (initialValue) {
            const formattedValue = formatRut(initialValue);
            setRut(formattedValue);
            const isValidRut = validateRut(initialValue);
            const isValidEmpresarial = tipoDocumento && [33, 34, 43, 46, 56, 61].includes(tipoDocumento) 
                ? validateRutEmpresarial(initialValue) 
                : true;
            setIsValid(isValidRut && isValidEmpresarial);
            setShowMessage(true);
        }
    }, [initialValue, tipoDocumento]);

    // Determinar si es RUT empresarial
    const esRutEmpresarial = () => {
        if (!tipoDocumento) return false;
        return [33, 34, 43, 46, 56, 61].includes(tipoDocumento);
    };

    // Obtener mensaje de validación
    const getValidationMessage = () => {
        if (!rut || rut.length < 8) return null;
        
        if (!validateRut(rut)) {
            return "RUT inválido";
        }
        
        if (esRutEmpresarial() && !validateRutEmpresarial(rut)) {
            return "RUT debe ser empresarial (7-8 dígitos)";
        }
        
        if (esRutEmpresarial() && empresaEncontrada) {
            return `✓ ${empresaEncontrada.razon_social || empresaEncontrada.name}`;
        }
        
        if (esRutEmpresarial()) {
            return "RUT válido - Empresa no encontrada";
        }
        
        return "RUT válido";
    };

    const validationMessage = getValidationMessage();
    const isEmpresarial = esRutEmpresarial();

    return (
        <div className="relative z-0">
            <div className="flex gap-2">
                <div className="flex-1 relative">
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
                            inputClassName
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
                
                {/* Botón de consulta para empresas */}
                {isEmpresarial && (
                    <button
                        type="button"
                        onClick={handleConsultarEmpresa}
                        disabled={!validateRutEmpresarial(rut) || isConsulting}
                        className={`px-3 py-2 text-sm rounded-md transition-colors ${
                            validateRutEmpresarial(rut) && !isConsulting
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        title="Consultar empresa"
                    >
                        {isConsulting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Search className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>

            {/* Mensaje de validación */}
            {showValidation && validationMessage && (
                <div className={`mt-1 text-xs ${
                    validationMessage.startsWith('✓') 
                        ? 'text-green-600' 
                        : validationMessage.includes('inválido') || validationMessage.includes('debe ser')
                        ? 'text-red-600'
                        : 'text-blue-600'
                }`}>
                    {validationMessage}
                </div>
            )}

            {/* Indicador de tipo de RUT */}
            {isEmpresarial && (
                <div className="mt-1 flex items-center text-xs text-blue-600">
                    <Building2 className="w-3 h-3 mr-1" />
                    RUT empresarial requerido
                </div>
            )}
        </div>
    );
};

export default RutInput;
