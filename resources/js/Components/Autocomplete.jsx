import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Props:
 * - data: array de strings o de objetos (opcional si usas onSearch)
 * - getLabel: (item) => string  -> cómo mostrar cada item
 * - getKey: (item) => string|number -> key único (por defecto usa getLabel)
 * - onSearch: async (query) => array  -> búsqueda remota (opcional)
 * - minChars: mínimo de caracteres para buscar (default 1)
 * - debounceMs: demora antes de buscar (default 250ms)
 * - onSelect: (item) => void
 */
export default function Autocomplete({
  data = [],
  getLabel,
  getKey,
  onSearch,
  minChars = 1,
  debounceMs = 250,
  onSelect,
  placeholder = "Escribe para buscar...",
  className = "",
  inputClassName = "",
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Normalizadores
  const labelOf = useMemo(() => {
    if (getLabel) return getLabel;
    return (item) =>
      item == null
        ? ""
        : typeof item === "string"
        ? item
        : typeof item === "object"
        ? String(item.name ?? item.label ?? item.title ?? item.value ?? "")
        : String(item);
  }, [getLabel]);

  const keyOf = useMemo(() => {
    if (getKey) return getKey;
    return (item, idx) => {
      const lbl = labelOf(item);
      return (item && (item.id ?? item.key)) ?? `${lbl}-${idx}`;
    };
  }, [getKey, labelOf]);

  // Debounce
  const debounce = (fn, ms) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  const runSearch = useMemo(
    () =>
      debounce(async (q) => {
        if (!q || q.length < minChars) {
          setResults([]);
          setOpen(false);
          setLoading(false);
          setErr(null);
          return;
        }
        try {
          setLoading(true);
          setErr(null);
          if (onSearch) {
            const remote = await onSearch(q);
            setResults(Array.isArray(remote) ? remote : []);
          } else {
            // filtro local defensivo
            const asArray = Array.isArray(data) ? data : [];
            const ql = q.toLowerCase();
            setResults(
              asArray.filter((it) => labelOf(it).toLowerCase().includes(ql))
            );
          }
          setOpen(true);
        } catch (e) {
          setErr(e?.message ?? "Error al buscar");
          setResults([]);
          setOpen(true);
        } finally {
          setLoading(false);
        }
      }, debounceMs),
    [onSearch, data, minChars, debounceMs, labelOf]
  );

  useEffect(() => {
    if (!isFocused) return; // ⛔️ no abras si no hay foco
    runSearch(query);
  }, [query, isFocused]);

  // Cerrar al click fuera
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (item) => {
    const lbl = labelOf(item);
    setQuery(lbl);
    setOpen(false);
    setActiveIndex(-1);
    onSelect && onSelect(item);
  };

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < results.length) {
        e.preventDefault();
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          if (results.length) setOpen(true);
        }}
        onBlur={() => {
          // pequeño delay para permitir click en una opción
          setTimeout(() => {
            setIsFocused(false);
            setOpen(false);
          }, 120);
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300 ${inputClassName}`}
        autoComplete="off"
      />

      {open && (
        <div className="absolute z-20 w-full mt-1 overflow-auto bg-white border rounded-lg shadow-lg max-h-72">
          {loading && (
            <div className="px-3 py-2 text-sm text-gray-500">Buscando…</div>
          )}
          {err && !loading && (
            <div className="px-3 py-2 text-sm text-red-600">{err}</div>
          )}
          {!loading && !err && results.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              Sin resultados
            </div>
          )}
          {!loading &&
            !err &&
            results.map((item, idx) => {
              const lbl = labelOf(item);
              return (
                <button
                  type="button"
                  key={keyOf(item, idx)}
                  onClick={() => handleSelect(item)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${
                    idx === activeIndex ? "bg-blue-100" : ""
                  }`}
                >
                  {lbl}
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}
