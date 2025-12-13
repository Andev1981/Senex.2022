import { FileText, Package, Receipt, FileCheck } from "lucide-react";

/* Tipos de dte estilos */
export const dtesTypes = {
  boleta: {
    code: 39,
    name: "Boleta Electrónica",
    icon: Receipt,
    exento: false,
    label: "Boleta",
    styles: {
      text: "text-blue-600",
      border: "border-blue-500",
      bg_cover: "bg-blue-500",
      bg: "bg-blue-50",
      badge: "bg-blue-100 text-blue-700",
    },
  },
  boleta_exenta: {
    code: 41,
    name: "Boleta Electrónica Exenta",
    icon: Receipt,
    exento: true,
    label: "Boleta Exenta",
    styles: {
      text: "text-purple-600",
      border: "border-purple-500",
      bg_cover: "bg-purple-500",
      bg: "bg-purple-50",
      badge: "bg-purple-100 text-purple-700",
    },
  },
  factura: {
    code: 33,
    name: "Factura Electrónica",
    icon: FileText,
    exento: false,
    label: "Factura",
    styles: {
      text: "text-green-600",
      border: "border-green-500",
      bg_cover: "bg-green-500",
      bg: "bg-green-50",
      badge: "bg-green-100 text-green-700",
    },
  },
  factura_exenta: {
    code: 34,
    name: "Factura Electrónica Exenta",
    icon: FileText,
    exento: true,
    label: "Factura Exenta",
    styles: {
      text: "text-teal-600",
      border: "border-teal-500",
      bg_cover: "bg-teal-500",
      bg: "bg-teal-50",
      badge: "bg-teal-100 text-teal-700",
    },
  },
  factura_compra: {
    code: 46,
    name: "Factura de Compra",
    icon: FileCheck,
    exento: false,
    label: "Factura de Compra",
    styles: {
      text: "text-orange-600",
      border: "border-orange-500",
      bg_cover: "bg-orange-500",
      bg: "bg-orange-50",
      badge: "bg-orange-100 text-orange-700",
    },
  },
  nota_credito: {
    code: 61,
    name: "Nota de Crédito",
    icon: FileText,
    exento: false,
    label: "Nota de Crédito",
    styles: {
      text: "text-red-600",
      border: "border-red-500",
      bg_cover: "bg-red-500",
      bg: "bg-red-50",
      badge: "bg-red-100 text-red-700",
    },
  },
  nota_debito: {
    code: 56,
    name: "Nota de Débito",
    icon: FileText,
    exento: false,
    label: "Nota de Débito",
    styles: {
      text: "text-yellow-600",
      border: "border-yellow-500",
      bg_cover: "bg-yellow-500",
      bg: "bg-yellow-50",
      badge: "bg-yellow-100 text-yellow-700",
    },
  },
  guia_despacho: {
    code: 52,
    name: "Guía de Despacho",
    icon: Package,
    exento: true,
    label: "Guia de Despacho",
    styles: {
      text: "text-indigo-600",
      border: "border-indigo-500",
      bg_cover: "bg-indigo-500",
      bg: "bg-indigo-50",
      badge: "bg-indigo-100 text-indigo-700",
    },
  },
};

export const DTES_TYPES = Object.entries(dtesTypes).map(([value, cfg]) => ({
  // 🎯 CORRECCIÓN CLAVE: Agrega 'value' (la clave de la cadena)
  value: value,

  // Incluimos todas las propiedades que necesita el botón
  label: cfg.label,
  code: cfg.code,
  icon: cfg.icon,
  exento: cfg.exento,

  // Incluimos todos los estilos
  styles: cfg.styles, // ✅ Ahora apunta directamente al objeto styles dentro de cfg
}));

// Función "Helper" de búsqueda, exportada desde el mismo archivo de Constantes.
export const getDtesConfigByCode = (code) => {
  // Busca el objeto DTE que coincide con el código numérico
  const foundEntry = Object.values(dtesTypes).find(
    (item) => item.code === code
  );

  // Retorna la configuración o el fallback seguro
  return (
    foundEntry || {
      label: "Desconocido",
      styles: {
        text: "text-gray-600",
        border: "border-gray-500",
        bg_cover: "bg-gray-500",
        bg: "bg-gray-100",
        badge: "bg-gray-200 text-gray-700",
      },
    }
  );
};
