// components/RutInput.jsx
import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Building2, Search } from "lucide-react";

const RutInput = ({
  name = "rut",
  value = "", // ← CONTROLADO
  onChange, // ← debe devolver el valor canónico (sin puntos, con guion y DV)
  onValidationChange,
  showValidation = true,
  placeholder = "12345678-9",
  className = "",
  inputClassName = "",
  disabled = false,
  required = false,
  error,
  setRutError,
  tipoDocumento = null, // Para saber si es factura
  onEmpresaEncontrada = null, // Callback cuando se encuentra una empresa
  empresasExistentes = [], // Lista de empresas en BD local
}) => {
  // estado SOLO para el TEXTO formateado que se muestra
  const [display, setDisplay] = useState("");

  // ---------- Helpers ----------
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

  const normalizeCanonical = (raw) => {
    if (!raw) return "";
    let v = String(raw).toUpperCase().replace(/\./g, "").replace(/\s+/g, "");
    v = v.replace(/[^0-9K\-]/g, "");
    if (!v.includes("-") && v.length > 1)
      v = v.slice(0, -1) + "-" + v.slice(-1);
    return v;
  };

  const validateRut = (rutValue) => {
    const canon = normalizeCanonical(rutValue).replace(/\./g, "");
    const m = /^([0-9]{1,9})-([0-9K])$/.exec(canon);
    if (!m) return false;
    const base = m[1],
      dv = m[2];
    return calculateVerifierDigit(base) === dv;
  };

  // RUT empresarial (7-8 dígitos sin DV)
  const validateRutEmpresarial = (rutValue) => {
    if (!validateRut(rutValue)) return false;
    const canon = normalizeCanonical(rutValue).replace(/\./g, "");
    const base = canon.split("-")[0];
    return base.length >= 7 && base.length <= 8;
  };

  const formatRut = (val) => {
    const rutClean = String(val).replace(/[^0-9kK]/g, "");
    if (rutClean.length <= 1) return rutClean;

    const dv = rutClean.slice(-1).toUpperCase();
    let digits = rutClean.slice(0, -1);
    let result = "-" + dv;

    if (digits.length > 6) {
      const miles = digits.slice(-3);
      const millones = digits.slice(-6, -3);
      const billones = digits.slice(0, -6);
      result =
        (billones ? billones + "." : "") + millones + "." + miles + result;
    } else {
      while (digits.length > 3) {
        result = "." + digits.slice(-3) + result;
        digits = digits.slice(0, -3);
      }
      if (digits) result = digits + result;
    }
    return result;
  };

  const esRutEmpresarial = () =>
    tipoDocumento && [33, 34, 43, 46, 56, 61].includes(tipoDocumento);

  // ---------- Side effects ----------
  // Mantener display sincronizado con value del padre
  useEffect(() => {
    const canon = normalizeCanonical(value);
    setDisplay(formatRut(canon));
  }, [value]);

  // ---------- Empresa local / consulta simulada ----------
  const buscarEmpresaLocal = (rut) => {
    const canon = normalizeCanonical(rut).replace(/[.-]/g, "");
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
      await new Promise((r) => setTimeout(r, 1000)); // Simulación
      return null;
    } catch (e) {
      console.error("Error consultando empresa:", e);
      return null;
    } finally {
      setIsConsulting(false);
    }
  };

  // ---------- Handlers ----------
  const handleChange = (e) => {
    const raw = e.target.value;
    const canon = normalizeCanonical(raw); // ← valor que enviaremos al padre (sin puntos)
    const formatted = formatRut(canon); // ← lo que se muestra

    setDisplay(formatted);

    const okRut = validateRut(canon);
    const okEmp = esRutEmpresarial() ? validateRutEmpresarial(canon) : true;
    const isValid = okRut && okEmp;

    setRutError?.(!isValid && canon.length > 0);
    onValidationChange?.(isValid);
    onChange?.(canon); // ← envía valor canónico al form
    if (!isValid) setEmpresaEncontrada(null);
  };

  const handleConsultarEmpresa = () => {
    if (display && validateRutEmpresarial(display)) {
      consultarEmpresa(display);
    }
  };

  // ---------- Mensajes ----------
  const getValidationMessage = () => {
    const has = display && normalizeCanonical(display).length >= 2;
    if (!has) return null;
    if (!validateRut(display)) return "RUT inválido";
    if (esRutEmpresarial() && !validateRutEmpresarial(display))
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
    <div className={"relative z-0 " + className}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            id={name}
            name={name}
            type="text"
            value={display}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={
              "w-full rounded-md pl-10 border-[0.5px] border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-200 " +
              inputClassName
            }
            maxLength={12}
          />
          <div className="absolute inset-y-0 flex items-center pr-3 left-2">
            {isValid ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </div>

        {esRutEmpresarial() && (
          <button
            type="button"
            onClick={handleConsultarEmpresa}
            disabled={!validateRutEmpresarial(display) || isConsulting}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              validateRutEmpresarial(display) && !isConsulting
                ? "bg-blue-600 text-white hover:bg-blue-700"
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

      {showValidation && validationMessage && (
        <div
          className={
            "mt-1 text-xs " +
            (validationMessage.startsWith("✓")
              ? "text-green-600"
              : /inválido|debe ser/.test(validationMessage)
              ? "text-red-600"
              : "text-blue-600")
          }
        >
          {validationMessage}
        </div>
      )}

      {esRutEmpresarial() && (
        <div className="flex items-center mt-1 text-xs text-blue-600">
          <Building2 className="w-3 h-3 mr-1" />
          RUT empresarial requerido
        </div>
      )}
    </div>
  );
};

export default RutInput;
