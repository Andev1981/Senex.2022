import Modal from "@/components/Modal";
import { useEffect, useMemo, useState, useRef } from "react";
import { useForm, router } from "@inertiajs/react";
import { Search, X } from "lucide-react"; // para el Autocomplete
import RutInput from "./RutInput";
import ChilePhoneInput from "./ChilePhoneInput";

// --- Hook simple de debounce para el Autocomplete ---
function useDebouncedValue(value, delay = 300) {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return deb;
}

// --- AutocompleteSelect: soporta datos locales (options) o remotos (loader) con debounce ---
function AutocompleteSelect({
  label,
  value, // any | null
  onChange, // (val:any)=>void
  placeholder = "Buscar…",
  options = [], // [{value, label}]
  loader = null, // async (query:string) => [{value, label}]
  noResultsText = "Sin resultados",
  disabled = false,
  name,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [remoteOptions, setRemoteOptions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const debQuery = useDebouncedValue(query, 250);

  const allOptions = loader ? remoteOptions : options;
  const selected = useMemo(
    () => allOptions.find((o) => o.value === value) || null,
    [allOptions, value]
  );

  // Carga remota
  useEffect(() => {
    let cancel = false;
    if (!loader) return;
    (async () => {
      setLoading(true);
      try {
        const rows = await loader(debQuery || "");
        if (!cancel) setRemoteOptions(rows || []);
      } catch (e) {
        if (!cancel) setRemoteOptions([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [debQuery, loader]);

  // Filtrado local si no hay loader
  const filtered = useMemo(() => {
    if (loader) return allOptions; // servidor ya filtra
    const q = (query || "").toLowerCase().trim();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [query, options, loader, allOptions]);

  function handleKeyDown(e) {
    if (disabled) return;
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && filtered[activeIndex]) {
        const pick = filtered[activeIndex];
        onChange(pick.value);
        setQuery(pick.label);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function openMenu() {
    if (disabled) return;
    setOpen(true);
    setActiveIndex(-1);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function pickOption(opt) {
    if (disabled) return;
    onChange(opt.value);
    setQuery(opt.label);
    setOpen(false);
  }

  function clearSelection() {
    if (disabled) return;
    onChange(null);
    setQuery("");
    setOpen(false);
  }

  useEffect(() => {
    if (selected && !open) setQuery(selected.label);
  }, [selected, open]);

  return (
    <div className="w-full">
      {label && (
        <label
          className="block mb-1 text-xs font-semibold text-gray-600"
          htmlFor={name}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <div
          className={`flex items-center w-full px-3 py-2 border-2 rounded-lg transition ${
            disabled
              ? "opacity-60 cursor-not-allowed border-gray-200"
              : "cursor-text border-gray-200 focus-within:border-blue-500"
          }`}
          onClick={openMenu}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <Search className="w-4 h-4 mr-2 text-gray-400" />
          <input
            id={name}
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 text-sm bg-transparent outline-none"
            disabled={disabled}
          />
          {value != null && (
            <button
              type="button"
              className="p-1 ml-1 rounded hover:bg-gray-100"
              onClick={clearSelection}
              aria-label="Limpiar"
              disabled={disabled}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {open && !disabled && (
          <div
            className="absolute z-20 w-full mt-1 overflow-auto bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60"
            role="listbox"
            ref={listRef}
          >
            {loading ? (
              <div className="p-3 text-sm text-gray-500">Cargando…</div>
            ) : filtered.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">{noResultsText}</div>
            ) : (
              filtered.map((opt, idx) => {
                const isActive = idx === activeIndex;
                const isSelected = value === opt.value;
                return (
                  <div
                    key={`${name}-${opt.value}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickOption(opt)}
                    className={`px-3 py-2 text-sm cursor-pointer ${
                      isActive ? "bg-blue-50" : ""
                    } ${isSelected ? "font-medium" : ""}`}
                  >
                    {opt.label}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResourceFormModal({
  open,
  onClose,
  title,
  description,
  schema = [],
  initialValues = {},
  submitRoute,
  method = "post", // "patch" | "put" | "delete"
  afterSubmitReloadOnly = [],
  extraButtons, // (data, { setData, processing }) => JSX
  columns = 2, // 1..4
  maxWidth,
  errorBag, // opcional si usas varios formularios en la misma página
  submitLabel,
}) {
  // Usa métodos de useForm para que los errores (422) lleguen a errors
  const form = useForm(initialValues);
  const { data, setData, processing, errors, reset, clearErrors } = form;

  const [hasFile, setHasFile] = useState(false);

  // --- Date/Time helpers ---
  const todayStr = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const toDateInput = (val) => (val ? String(val).slice(0, 10) : "");
  const resolveDateBound = (b) => (b === "today" ? todayStr() : b || undefined);
  const toTimeInput = (val) => {
    const m = val ? String(val).match(/^\d{2}:\d{2}/) : null;
    return m ? m[0] : "";
  };
  const toDatetimeLocalInput = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "";
    const tzless = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return tzless.toISOString().slice(0, 16);
  };

  // Clases de grid seguras para Tailwind (evita md:grid-cols-${columns})
  const gridColsClass = useMemo(() => {
    const map = {
      1: "md:grid-cols-1",
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
      4: "md:grid-cols-4",
      5: "md:grid-cols-5",
      6: "md:grid-cols-6",
    };
    return map[columns] || "md:grid-cols-2";
  }, [columns]);

  // Reset al abrir: Solo cuando 'open' cambia a true
  useEffect(() => {
    if (open) {
      reset(initialValues);
      clearErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // Eliminamos JSON.stringify(initialValues) para evitar bucles infinitos

  // Detecta si hay campo file (también soporta `isFile: true` en el schema)
  useEffect(() => {
    setHasFile(schema.some((f) => f.type === "file" || f.isFile));
  }, [schema]);

  // Campos visibles según visibleIf
  const fields = useMemo(
    () =>
      schema.filter((f) =>
        typeof f.visibleIf === "function" ? f.visibleIf(data) : true
      ),
    [schema, data]
  );

  const onFieldChange = (f, raw) => {
    const next = f.parse ? f.parse(raw, data) : raw;

    setData(f.name, next);
    if (errors[f.name]) clearErrors(f.name);

    // Limpiar dependientes en cascada usando dependsOn
    const queue = schema
      .filter(
        (ch) => Array.isArray(ch.dependsOn) && ch.dependsOn.includes(f.name)
      )
      .map((ch) => ch.name);

    const visited = new Set(queue);
    while (queue.length) {
      const childName = queue.shift();
      setData(childName, null);
      clearErrors(childName);

      // Propaga a nietos/bisnietos
      schema.forEach((grand) => {
        if (
          Array.isArray(grand.dependsOn) &&
          grand.dependsOn.includes(childName) &&
          !visited.has(grand.name)
        ) {
          visited.add(grand.name);
          queue.push(grand.name);
        }
      });
    }

    // Reacción custom del campo, si existe
    if (typeof f.onChange === "function") f.onChange(next, data, setData);
  };

  const submit = (e) => {
    e.preventDefault();
    const action = method.toLowerCase(); // "post" | "patch" | "put" | "delete"
    form[action](submitRoute, {
      preserveScroll: true,
      forceFormData: hasFile,
      ...(errorBag ? { errorBag } : {}),
      onSuccess: () => {
        reset();
        onClose?.();
        if (afterSubmitReloadOnly.length) {
          router.reload({ only: afterSubmitReloadOnly, preserveScroll: true });
        }
      },
      // onError: los errors ya quedan en `errors`
    });
  };

  return (
    <Modal
      title={title}
      description={description}
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
    >
      <form
        onSubmit={submit}
        noValidate
        className="px-4"
        encType={hasFile ? "multipart/form-data" : undefined}
      >
        <div className={`grid grid-cols-1 ${gridColsClass} gap-4`}>
          {fields.map((f) => {
            const isDisabled =
              typeof f.disabled === "function"
                ? f.disabled(data)
                : !!f.disabled;

            const opts =
              typeof f.options === "function"
                ? f.options(data)
                : f.options ?? [];

            const useAutocomplete =
              f.type === "select" &&
              (f.searchable || typeof f.asyncOptions === "function");

            return (
              <div
                key={f.name}
                className={`${
                  f.colSpan ? `col-span-${f.colSpan}` : " col-span-1"
                }`}
              >
                <label
                  htmlFor={f.name}
                  name={f.name}
                  className="ml-1 text-xs text-gray-500"
                >
                  {f.label}
                  {f.required && <span className="text-red-600"> *</span>}
                </label>

                {useAutocomplete ? (
                  <AutocompleteSelect
                    name={f.name}
                    label={null}
                    value={data[f.name] ?? null}
                    onChange={(val) => onFieldChange(f, val)}
                    placeholder={f.placeholder ?? "Selecciona…"}
                    options={opts}
                    loader={
                      typeof f.asyncOptions === "function"
                        ? (q) => f.asyncOptions(q, data)
                        : null
                    }
                    disabled={isDisabled}
                  />
                ) : f.type === "select" ? (
                  <select
                    name={f.name}
                    className="w-full rounded-md border-[0.5px] border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-200"
                    value={data[f.name] ?? ""}
                    onChange={(e) => onFieldChange(f, e.target.value)}
                    disabled={isDisabled}
                  >
                    <option className="text-gray-500" value="">
                      {f.placeholder ?? "Selecciona…"}
                    </option>
                    {opts.map((o) => (
                      <option key={`${f.name}-${o.value}`} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === "switch" ? (
                  <div className="flex items-center justify-between rounded-md border-[0.5px] border-gray-300 px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700">
                        {f.placeholder ?? ""}
                      </span>
                    </div>

                    {/* Toggle accesible */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!!(data[f.name] ?? false)}
                      aria-label={f.label}
                      onClick={() => onFieldChange(f, !(data[f.name] ?? false))}
                      disabled={isDisabled}
                      className={`relative inline-flex h-6 w-11 items-center overflow-hidden rounded-full transition
    ${isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
    ${data[f.name] ? "bg-blue-600" : "bg-gray-300"}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute left-0 top-0 h-6 w-6 rounded-full bg-white shadow ring-0 transition-transform
      ${data[f.name] ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </button>
                  </div>
                ) : f.type === "textarea" ? (
                  <textarea
                    name={f.name}
                    className="w-full rounded-md border-[0.5px] border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-200"
                    rows={f.rows ?? 3}
                    placeholder={f.placeholder}
                    value={data[f.name] ?? ""}
                    onChange={(e) => onFieldChange(f, e.target.value)}
                    disabled={isDisabled}
                  />
                ) : f.type === "file" ? (
                  <input
                    name={f.name}
                    type="file"
                    className="w-full rounded-md border-[0.5px] border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-200"
                    onChange={(e) =>
                      onFieldChange(f, e.target.files?.[0] || null)
                    }
                    accept={f.accept}
                    disabled={isDisabled}
                  />
                ) : f.type === "rut" ? (
                  <RutInput
                    name={f.name}
                    value={data[f.name] ?? ""}
                    onChange={(val) => onFieldChange(f, val)}
                    placeholder={f.placeholder ?? "12.345.678-9"}
                    disabled={isDisabled}
                    error={errors[f.name]}
                  />
                ) : f.type === "tel" ? (
                  <ChilePhoneInput
                    name={f.name}
                    value={data[f.name] ?? ""}
                    onChange={(val) => onFieldChange(f, val)}
                    placeholder={f.placeholder ?? "+56 9 1234 5678"}
                    disabled={isDisabled}
                    error={errors[f.name]}
                  />
                ) : f.type === "date" ? (
                  <input
                    name={f.name}
                    type="date"
                    className="w-full rounded-md border-[0.5px] border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-200"
                    value={toDateInput(data[f.name])}
                    onChange={(e) => onFieldChange(f, e.target.value)} // "YYYY-MM-DD"
                    min={resolveDateBound(f.min)}
                    max={resolveDateBound(f.max)}
                    disabled={isDisabled}
                  />
                ) : f.type === "time" ? (
                  <input
                    name={f.name}
                    type="time"
                    className="w-full rounded-md border-[0.5px] border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-200"
                    value={toTimeInput(data[f.name])}
                    onChange={(e) => onFieldChange(f, e.target.value)} // "HH:MM"
                    step={f.step ?? 60}
                    disabled={isDisabled}
                  />
                ) : f.type === "datetime-local" ? (
                  <input
                    name={f.name}
                    type="datetime-local"
                    className="w-full rounded-md border-[0.5px] border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-200"
                    value={toDatetimeLocalInput(data[f.name])}
                    onChange={(e) => onFieldChange(f, e.target.value)} // "YYYY-MM-DDTHH:MM"
                    min={f.min ? toDatetimeLocalInput(f.min) : undefined}
                    max={f.max ? toDatetimeLocalInput(f.max) : undefined}
                    disabled={isDisabled}
                  />
                ) : (
                  <input
                    name={f.name}
                    type={f.type || "text"}
                    className="w-full rounded-md border-[0.5px] border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-200"
                    placeholder={f.placeholder}
                    value={data[f.name] ?? ""}
                    onChange={(e) => onFieldChange(f, e.target.value)}
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    pattern={f.pattern}
                    disabled={isDisabled}
                  />
                )}

                {f.help && (
                  <p className="mt-1 text-xs text-gray-500">{f.help}</p>
                )}
                {errors[f.name] && (
                  <p className="text-xs text-red-600">{errors[f.name]}</p>
                )}
              </div>
            );
          })}
        </div>

        <hr className="my-2" />

        <div className="flex items-center justify-between py-4">
          {typeof extraButtons === "function" ? (
            <div className="flex gap-2">
              {extraButtons(data, { setData, processing })}
            </div>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 rounded"
            >
              Cancelar
            </button>
            <button
              disabled={processing}
              className="px-4 py-2 text-white bg-blue-600 rounded disabled:opacity-60"
            >
              {processing ? "Guardando…" : submitLabel}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
