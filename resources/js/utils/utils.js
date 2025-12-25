export const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

export const fmtCLP = (v) => {
  const n = Number(v); // convierte string → number
  return Number.isFinite(n) && n >= 0
    ? n.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      })
    : "-";
};

// ✅ Agregar esta función a tu archivo utils.js

/**
 * Convierte una fecha en formato ISO completo a formato YYYY-MM-DD
 * para inputs type="date"
 *
 * @param {string} dateStr - Fecha en cualquier formato ISO
 * @returns {string} Fecha en formato YYYY-MM-DD o string vacío
 *
 * Ejemplos:
 * "2025-11-26T03:00:00.000000Z" → "2025-11-26"
 * "2025-11-26" → "2025-11-26"
 * null → ""
 */
export const fmtDateISO = (dateStr) => {
  if (!dateStr) return "";

  // Si viene en formato ISO completo con timestamp (2025-11-26T03:00:00.000000Z)
  // extraer solo la parte de la fecha (2025-11-26)
  if (typeof dateStr === "string" && dateStr.includes("T")) {
    return dateStr.split("T")[0];
  }

  // Si ya está en formato YYYY-MM-DD, retornar tal cual
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Fallback: intentar parsear y formatear
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const fmtDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const fmtShortDate = (iso) =>
  new Date(iso).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
  });

export const fmtTime = (timeStr) => {
  if (!timeStr) return "-";
  return timeStr.slice(0, 5); // HH:MM
};

export const avg = (arr) =>
  arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

export const pct = (n) =>
  typeof n === "number" && !isNaN(n) ? `${n}%` : n ? `${Number(n)}%` : null;

/**
 * Formatea un número o string a formato RUT Chileno (XX.XXX.XXX-X)
 * @param {string|number} rut - El RUT sucio (ej: "123456789" o "12.345.678-9")
 * @returns {string} - El RUT formateado
 */
export const fmtRUT = (rut) => {
  if (!rut) return "";

  // 1. Limpiar: Dejar solo números y 'k' o 'K'
  let value = String(rut).replace(/[^0-9kK]/g, "");

  // 2. Separar cuerpo y dígito verificador
  const body = value.slice(0, -1);
  const dv = value.slice(-1).toUpperCase();

  // 3. Formatear el cuerpo con puntos
  // Usamos una expresión regular para poner puntos cada 3 dígitos de atrás pa'lante
  const bodyFormatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${bodyFormatted}-${dv}`;
};

/**
 * Valida si un RUT es matemáticamente correcto (Algoritmo Módulo 11)
 * @param {string} rut
 * @returns {boolean}
 */
export const validateRUT = (rut) => {
  if (!rut || rut.trim().length < 3) return false;

  // Limpiar
  const value = String(rut).replace(/[^0-9kK]/g, "");
  const body = value.slice(0, -1);
  const dv = value.slice(-1).toUpperCase();

  // Validar largo mínimo
  if (body.length < 6) return false;

  // Calcular dígito esperado
  let suma = 0;
  let multiplo = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    suma += multiplo * parseInt(body.charAt(i));
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const dvEsperado = 11 - (suma % 11);
  let dvCalculado = "";

  if (dvEsperado === 11) dvCalculado = "0";
  else if (dvEsperado === 10) dvCalculado = "K";
  else dvCalculado = String(dvEsperado);

  return dvCalculado === dv;
};
