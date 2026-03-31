import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const PatenteInput = ({ usarGuion = true }) => {
    const [patente, setPatente] = useState("");
    const [isValid, setIsValid] = useState(false);
    const [formato, setFormato] = useState("");

    const separador = usarGuion ? "-" : ".";

    // Expresiones regulares para validar patentes
    const patronAntiguo = /^[a-zA-Z]{2}[\.\-\s]?[0-9]{2}[\.\-\s]?[0-9]{2}$/;
    const patronNuevo =
        /^[bB][a-zA-Z]{3}[\.\-\s]?[0-9]{2}|[a-zA-Z]{4}[\.\-\s]?[0-9]{2}$/;

    const handleChange = (e) => {
        let valor = e.target.value.toUpperCase();

        // Eliminar caracteres no permitidos
        valor = valor.replace(/[^A-Z0-9\.\-\s]/g, "");

        // Limitar a 8 caracteres máximo (incluyendo separadores)
        if (valor.length > 8) return;

        setPatente(valor);

        // Validar formato
        if (valor.length > 0) {
            const valorSinSeparador = valor.replace(/[\.\-\s]/g, "");

            if (patronAntiguo.test(valorSinSeparador)) {
                setFormato("antiguo");
                setIsValid(true);
            } else if (patronNuevo.test(valorSinSeparador)) {
                setFormato("nuevo");
                setIsValid(true);
            } else {
                setFormato("");
                setIsValid(false);
            }
        } else {
            setFormato("");
            setIsValid(true);
        }
    };

    const formatearPatente = (valor) => {
        if (!valor) return "";
        const valorSinSeparador = valor.replace(/[\.\-\s]/g, "");

        if (formato === "antiguo" && valorSinSeparador.length === 6) {
            return `${valorSinSeparador.slice(
                0,
                2
            )}${separador}${valorSinSeparador.slice(
                2,
                4
            )}${separador}${valorSinSeparador.slice(4)}`;
        } else if (formato === "nuevo" && valorSinSeparador.length === 6) {
            return `${valorSinSeparador.slice(
                0,
                4
            )}${separador}${valorSinSeparador.slice(4)}`;
        }

        return valor;
    };

    const getPlaceholder = () => {
        return usarGuion ? `Ej: BBXX-22 o XX-22-22` : `Ej: BBXX.22 o XX.22.22`;
    };

    return (
        <div className="relative z-0">
            <label className="absolute left-0 px-1 ml-1 rounded-lg text-xs text-white duration-100 ease-linear -translate-y-3 bg-[#e28930] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:ml-1 peer-focus:-translate-y-3 peer-focus:px-1 peer-focus:text-s">
                Patente Chilena
            </label>
            <input
                type="text"
                value={formatearPatente(patente)}
                onChange={handleChange}
                placeholder={getPlaceholder()}
                className={`rounded-md w-full pl-10 border-gray-100 shadow-sm focus:border-[#e28930] focus:ring-[#e28930] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-[#e28930] dark:focus:ring-[#e28930]
          ${
              isValid
                  ? "border-gray-100 focus:border-[#e28930] focus:ring-[#e28930]"
                  : "border-red-100 focus:border-red-500 focus:ring-red-500"
          }`}
            />
            <div className="absolute inset-y-0 flex items-center pr-3 left-2">
                {!isValid && <AlertCircle className="w-4 h-4 text-gray-500" />}
                {isValid && formato && (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
            </div>
        </div>
    );
};

export default PatenteInput;
