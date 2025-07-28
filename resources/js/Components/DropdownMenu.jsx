import React, { useState } from "react";
import { Edit, Trash2, FileText, Award } from "lucide-react";

// Componente del menú desplegable
export default function DropdownMenu({
    row,
    resumen,
    handleOpenCert,
    postulations,
    handleOpenModalDelete,
}) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleOptionClick = (action) => {
        action();
        setIsOpen(false);
    };

    // Opciones según el status
    const getOptions = () => {
        if (row.status === "FINALIZADO") {
            return [
                {
                    label: "Ver Resumen",
                    icon: <FileText className="w-4 h-4" />,
                    action: () => resumen(row?.postulation_id),
                    className: "text-blue-700 hover:bg-blue-50",
                },
                {
                    label: "Descargar Certificado",
                    icon: <Award className="w-4 h-4" />,
                    action: () => handleOpenCert(row?.postulation_id),
                    className: "text-green-700 hover:bg-green-50",
                },
            ];
        } else if (row.status === "PENDIENTE") {
            return [
                {
                    label: "Editar Postulación",
                    icon: <Edit className="w-4 h-4" />,
                    action: () => postulations(row),
                    className: "text-blue-700 hover:bg-blue-50",
                },
                {
                    label: "Eliminar",
                    icon: <Trash2 className="w-4 h-4" />,
                    action: () => handleOpenModalDelete(row),
                    className: "text-red-700 hover:bg-red-50",
                },
            ];
        }
        return [];
    };

    const options = getOptions();

    // Si no hay opciones disponibles, no mostrar nada
    if (options.length === 0) {
        return <span className="text-sm text-gray-400">-</span>;
    }

    return (
        <div className="relative inline-block">
            <button
                onClick={toggleDropdown}
                className="p-2 transition-colors duration-200 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                aria-label="Opciones"
            >
                {/* Tres puntos verticales */}
                <div className="flex flex-col items-center justify-center space-y-1">
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                </div>
            </button>

            {isOpen && (
                <>
                    {/* Overlay para cerrar el dropdown al hacer click fuera */}
                    <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menú desplegable mejorado */}
                    <div
                        className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] overflow-hidden"
                        style={{ position: "absolute", zIndex: 9999 }}
                    >
                        <div className="py-1">
                            {options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() =>
                                        handleOptionClick(option.action)
                                    }
                                    className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-all duration-200 ${
                                        option.className ||
                                        "text-gray-700 hover:bg-gray-50"
                                    } ${index !== options.length - 1 ? "border-b border-gray-100" : ""}`}
                                >
                                    <span className="flex-shrink-0">
                                        {option.icon}
                                    </span>
                                    <span className="font-medium">
                                        {option.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
