import Modal from "@/Components/Modal";
import { useEffect, useMemo, useState } from "react";
import { useForm, router } from "@inertiajs/react";
import RutInput from "./RutInput";
import ChilePhoneInput from "./ChilePhoneInput";

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
}) {
  // Usa métodos de useForm para que los errores (422) lleguen a errors
  const form = useForm(initialValues);
  const { data, setData, processing, errors, reset, clearErrors } = form;

  const [hasFile, setHasFile] = useState(false);
  const submitLabel = initialValues?.id ? "Actualizar" : "Guardar";

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
    };
    return map[columns] || "md:grid-cols-2";
  }, [columns]);

  // Reset al abrir y cuando cambian los initialValues
  useEffect(() => {
    if (open) {
      reset(initialValues);
      clearErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, JSON.stringify(initialValues)]);

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
    // limpia error del campo al cambiar
    if (errors[f.name]) clearErrors(f.name);
    // callback de reacción entre campos
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
          {fields.map((f) => (
            <div
              key={f.name}
              className={`col-span-1 ${
                f.colSpan ? `md:col-span-${f.colSpan}` : ""
              }`}
            >
              <label className="text-xs text-gray-500">
                {f.label}
                {f.required && <span className="text-red-600"> *</span>}
              </label>

              {f.type === "select" ? (
                <select
                  className="w-full border-gray-300 rounded"
                  value={data[f.name] ?? ""}
                  onChange={(e) => onFieldChange(f, e.target.value)}
                  disabled={f.disabled}
                >
                  <option value="">{f.placeholder ?? "Selecciona…"}</option>
                  {f.options?.map((o) => (
                    <option key={`${f.name}-${o.value}`} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea
                  className="w-full border-gray-300 rounded"
                  rows={f.rows ?? 3}
                  placeholder={f.placeholder}
                  value={data[f.name] ?? ""}
                  onChange={(e) => onFieldChange(f, e.target.value)}
                  disabled={f.disabled}
                />
              ) : f.type === "file" ? (
                <input
                  type="file"
                  className="w-full border-gray-300 rounded"
                  onChange={(e) =>
                    onFieldChange(f, e.target.files?.[0] || null)
                  }
                  accept={f.accept}
                  disabled={f.disabled}
                />
              ) : f.type === "rut" ? (
                <RutInput
                  name={f.name}
                  value={data[f.name] ?? ""} // CONTROLADO
                  onChange={(val) => onFieldChange(f, val)} // guarda en useForm
                  placeholder={f.placeholder ?? "12.345.678-9"}
                  disabled={f.disabled}
                  error={errors[f.name]}
                />
              ) : f.type === "tel" ? (
                <ChilePhoneInput
                  name={f.name}
                  value={data[f.name] ?? ""}
                  onChange={(val) => onFieldChange(f, val)}
                  placeholder={f.placeholder ?? "+56 9 1234 5678"}
                  disabled={f.disabled}
                  error={errors[f.name]}
                />
              ) : f.type === "date" ? (
                <input
                  type="date"
                  className="w-full border-gray-300 rounded"
                  value={toDateInput(data[f.name])}
                  onChange={(e) => onFieldChange(f, e.target.value)} // "YYYY-MM-DD"
                  min={resolveDateBound(f.min)}
                  max={resolveDateBound(f.max)}
                  disabled={f.disabled}
                />
              ) : f.type === "time" ? (
                <input
                  type="time"
                  className="w-full border-gray-300 rounded"
                  value={toTimeInput(data[f.name])}
                  onChange={(e) => onFieldChange(f, e.target.value)} // "HH:MM"
                  step={f.step ?? 60}
                  disabled={f.disabled}
                />
              ) : f.type === "datetime-local" ? (
                <input
                  type="datetime-local"
                  className="w-full border-gray-300 rounded"
                  value={toDatetimeLocalInput(data[f.name])}
                  onChange={(e) => onFieldChange(f, e.target.value)} // "YYYY-MM-DDTHH:MM"
                  min={f.min ? toDatetimeLocalInput(f.min) : undefined}
                  max={f.max ? toDatetimeLocalInput(f.max) : undefined}
                  disabled={f.disabled}
                />
              ) : (
                <input
                  type={f.type || "text"}
                  className="w-full border-gray-300 rounded"
                  placeholder={f.placeholder}
                  value={data[f.name] ?? ""}
                  onChange={(e) => onFieldChange(f, e.target.value)}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  pattern={f.pattern}
                  disabled={f.disabled}
                />
              )}

              {f.help && <p className="mt-1 text-xs text-gray-500">{f.help}</p>}
              {errors[f.name] && (
                <p className="text-xs text-red-600">{errors[f.name]}</p>
              )}
            </div>
          ))}
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
