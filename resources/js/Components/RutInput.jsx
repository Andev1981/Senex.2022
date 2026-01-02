// components/RutInput.jsx
import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Building2, Search, Hash } from "lucide-react"; // Agregado Hash icon

const RutInput = ({
  name = "rut",
  value = "",
  onChange,
  onValidationChange,
  showValidation = true,
  placeholder = "12.345.678-9",
  className = "",
  inputClassName = "",
  disabled = false,
  required = false,
  setRutError,
  tipoDocumento = null,
  onEmpresaEncontrada = null,
  empresasExistentes = [],
  onBlur = null, 
}) => {
  const [display, setDisplay] = useState("");

  // Calcular dígito verificador
  const calculateVerifierDigit = (rutNumbers) => {
    const sequence = [2, 3, 4, 5, 6, 7];
    let sum = 0,
      idx = 0;
    for (let i = rutNumbers.length - 1; i >= 0; i--) {
      sum += parseInt(rutNumbers[i]) * sequence[idx % 6];
      idx++;
    }
    const r = 11 - (sum % 11);
    if (r === 11) return "0";
    if (r === 10) return "K";
    return String(r);
  };

  // Limpiar y normalizar (devuelve formato: 12345678-9)
  const cleanRut = (raw) => {
    if (!raw) return "";

    // Remover todo excepto números y K
    let clean = String(raw)
      .toUpperCase()
      .replace(/[^0-9K]/g, "");

    if (clean.length === 0) return "";
    if (clean.length === 1) return clean;

    // Separar: últimos caracteres son DV, el resto es el número     
    const dv = clean.slice(-1);
    const numero = clean.slice(0, -1);

    return `${numero}-${dv}`;
  };

  // Formatear para mostrar (12.345.678-9)
  const formatRut = (canonical) => {
    if (!canonical) return "";

    const parts = canonical.split("-");
    if (parts.length !== 2) return canonical;

    const numero = parts[0];
    const dv = parts[1];

    // Agregar puntos de miles
    const numeroFormateado = numero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${numeroFormateado}-${dv}`;
  };

  // Validar RUT
  const validateRut = (canonical) => {
    if (!canonical) return false;

    const parts = canonical.split("-");
    if (parts.length !== 2) return false;

    const numero = parts[0];
    const dv = parts[1];

    // Validar que número sea solo dígitos
    if (!/^\d+$/.test(numero)) return false;

    // Validar que DV sea número o K
    if (!/^[0-9K]$/.test(dv)) return false;

    // Validar longitud (1 a 9 dígitos)
    if (numero.length < 1 || numero.length > 9) return false;        

    // Calcular y comparar DV
    return calculateVerifierDigit(numero) === dv;
  };

  // RUT empresarial (7-8 dígitos)
  const validateRutEmpresarial = (canonical) => {
    if (!validateRut(canonical)) return false;
    const numero = canonical.split("-")[0];
    return numero.length >= 7 && numero.length <= 8;
  };

  const esRutEmpresarial = () =>
    tipoDocumento && [33, 34, 43, 46, 56, 61].includes(tipoDocumento);

  // Sincronizar display con value del padre
  useEffect(() => {
    if (value) {
      const cleaned = cleanRut(value);
      setDisplay(formatRut(cleaned));
    } else {
      setDisplay("");
    }
  }, [value]);

  // Buscar empresa
  const buscarEmpresaLocal = (rut) => {
    const canon = rut.replace(/[.-]/g, "");
    return (
      empresasExistentes.find(
        (emp) => emp.rut.replace(/[.-]/g, "") === canon
      ) || null
    );
  };

  const [empresaEncontrada, setEmpresaEncontrada] = useState(null);  
  const [isConsulting, setIsConsulting] = useState(false);

  const consultarEmpresa = async (rut) => {
    if (!validateRutEmpresarial(rut)) return null;
    setIsConsulting(true);
    try {
      const local = buscarEmpresaLocal(rut);
      if (local) {
        setEmpresaEncontrada(local);
        onEmpresaEncontrada?.(local);
        return local;
      }
      await new Promise((r) => setTimeout(r, 1000));
      return null;
    } catch (e) {
      console.error("Error consultando empresa:", e);
      return null;
    } finally {
      setIsConsulting(false);
    }
  };

  // Handle change
  const handleChange = (e) => {
    const raw = e.target.value;

    // Limpiar y normalizar
    const canonical = cleanRut(raw);

    // Formatear para mostrar
    const formatted = formatRut(canonical);
    setDisplay(formatted);

    // Validar
    const okRut = validateRut(canonical);
    const okEmp = esRutEmpresarial() ? validateRutEmpresarial(canonical) : true;
    const isValid = okRut && okEmp;

    setRutError?.(!isValid && canonical.length > 0);
    onValidationChange?.(isValid);

    // Enviar valor canónico al padre (formato: 12345678-9)
    onChange?.(canonical);

    if (!isValid) setEmpresaEncontrada(null);
  };

  const handleConsultarEmpresa = () => {
    const canonical = cleanRut(display);
    if (canonical && validateRutEmpresarial(canonical)) {
      consultarEmpresa(canonical);
    }
  };

  // Mensajes de validación
  const getValidationMessage = () => {
    const canonical = cleanRut(display);
    if (!canonical || canonical.length < 3) return null;

    if (!validateRut(canonical)) return "RUT inválido";

    if (esRutEmpresarial() && !validateRutEmpresarial(canonical))    
      return "RUT debe ser empresarial (7-8 dígitos)";

    if (esRutEmpresarial() && empresaEncontrada)
      return `✓ ${empresaEncontrada.razon_social || empresaEncontrada.name}`;

    if (esRutEmpresarial()) return "RUT válido - Empresa no encontrada";

    return "RUT válido";
  };

  const validationMessage = getValidationMessage();
  const isValid =
    validationMessage && !/inválido|debe ser/.test(validationMessage);

  return (
    <div className={"relative " + className}> {/* Elimino z-0 y dejo solo className para el contenedor principal */}
      <div className="flex gap-2">
        <div className="relative flex-1 group"> {/* Añadido group para focus-within en el icono */}
          {/* Icono Hash */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray opacity-40 group-focus-within:text-brand-primary transition-colors">
            <Hash className="w-4 h-4" />
          </div>

          <input
            id={name}
            name={name}
            type="text"
            value={display}
            onChange={handleChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={
              `w-full pl-12 pr-10 py-4 rounded-2xl border-2 font-mono font-black text-sm shadow-inner transition-all outline-none 
              ${!display ? 'border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary' : 
                isValid ? 'border-green-500/50 bg-green-50/10 focus:border-green-500 focus:ring-4 focus:ring-green-500/5' : 
                'border-red-500/50 bg-red-50/10 focus:border-red-500 focus:ring-4 focus:ring-red-500/5'} 
              ${inputClassName}`
            }
            maxLength={12}
          />
          {/* Íconos de validación (CheckCircle2, AlertCircle) */}
          {/* Muevo los íconos de validación a la derecha */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            {isValid ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />    
            ) : (
              // Solo muestro el AlertCircle si hay un valor y la validación falla
              display.length > 0 && !isValid && <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>

        {esRutEmpresarial() && (
          <button
            type="button"
            onClick={handleConsultarEmpresa}
            disabled={
              !validateRutEmpresarial(cleanRut(display)) || isConsulting
            }
            className={`flex-none px-3 py-2 text-sm rounded-2xl transition-all ${ // rounded-2xl aquí para el botón
              validateRutEmpresarial(cleanRut(display)) && !isConsulting
                ? "bg-brand-primary text-white hover:brightness-110 active:scale-95" // Colores enterprise para el botón
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            title="Consultar empresa"
          >
            {isConsulting ? (
              <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" />
            ) : (
              <Search className="w-4 h-4" />
            )}
                            </button>
                          )}
                        </div>
                  
                        {esRutEmpresarial() && (
                          <div className="flex items-center mt-1 ml-1 text-xs text-brand-gray opacity-60">
                            <Building2 className="w-3 h-3 mr-1" />
                            RUT empresarial requerido para DTE
                          </div>
                        )}
                      </div>
                    );
                  };export default RutInput;
