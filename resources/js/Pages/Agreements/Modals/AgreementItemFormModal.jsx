import { useForm } from "@inertiajs/react";
import { Save, X } from "lucide-react";
import SideModal from "@/Components/SideModal";
import { useEffect, useState } from "react";

export default function AgreementItemFormModal({
  show,
  onClose,
  agreement,
  rule,
  plans,
  sessionTypes,
}) {
  const isEdit = !!rule;

  const [plansList, setPlansList] = useState([]);

  const {
    data,
    setData,
    post,
    put,
    processing,
    errors,
    reset,
    clearErrors,
    transform,
  } = useForm({
    agreement_id: "",
    id: "",
    session_type_id: "",
    plan_id: "", // Se enviará como null si está vacío
    gross_price: 0,
    patient_share_clp: 0,
    insurance_share_clp: 0,
    patient_percentage: 0,
    insurance_percentage: 0,
    start_date: new Date().toISOString().slice(0, 10),
    end_date: "",
    notes: "",
  });

  // 2. LA MAGIA: Sincronizar Props con Inertia Form
  useEffect(() => {
    if (plans) {
      setPlansList(plans.filter((p) => p.id !== rule?.plan_id) || []);
    }
    if (show) {
      if (rule) {
        // MODO EDICIÓN: Cargamos los datos que vienen del prop
        setData({
          agreement_id: agreement?.id,
          id: rule?.id,
          session_type_id: rule?.session_type_id || "",
          plan_id: rule?.plan_id ? String(rule.plan_id) : "",

          // Montos y Porcentajes ORIGINALES (Incluye ambos porcentajes)
          gross_price: rule?.gross_price || 0,
          patient_share_clp: rule?.patient_share_clp || 0,
          insurance_share_clp: rule?.insurance_share_clp || 0,
          patient_percentage: rule?.patient_percentage || 0, // 💡 CAMPO DE COPAGO (%)
          insurance_percentage: rule?.insurance_percentage || 0, // 💡 CAMPO DE COBERTURA (%)

          // Vigencia y Notas
          start_date: rule?.start_date || new Date().toISOString().slice(0, 10),
          end_date: rule?.end_date || "",
          notes: rule?.notes || "",
        });
      } else {
        // MODO CREACIÓN: Si se abre y no hay convenio, limpiamos
        if (show) {
          reset();
          clearErrors();
          setData("agreement_id", agreement?.id || "");
        }
      }
    }
  }, [agreement, show, rule]); // Se ejecuta cada vez que cambia el convenio seleccionado

  const handleSubmit = (e) => {
    e.preventDefault();

    const routeName = isEdit
      ? "agreement.items.update"
      : "agreement.items.store";

    const method = isEdit ? put : post;
    const routeParams = isEdit ? { item: rule.id } : undefined;

    // Preprocesar datos antes de enviarlos
    transform((data) => ({
      ...data,
      // Convertir string vacío a null antes de que salga al servidor
      plan_id: data.plan_id === "" ? null : data.plan_id,
    }));

    method(route(routeName, routeParams), {
      onSuccess: () => {
        reset(); // Limpiar al guardar exitosamente
        onClose();
      },
      onError: (err) => console.error("Error al guardar regla:", err),
      preserveScroll: true,
    });
  };

  const handlePriceChange = (field, value) => {
    const newValue = parseInt(value) || 0;

    let updates = { [field]: newValue };
    let gross = field === "gross_price" ? newValue : data.gross_price;
    let patient =
      field === "patient_share_clp" ? newValue : data.patient_share_clp;

    const insuranceShare = Math.max(0, gross - patient);
    updates.insurance_share_clp = insuranceShare;

    let insurancePct = 0;
    let patientPct = 0;

    if (gross > 0) {
      // Porcentaje de Cobertura (Aseguradora)
      insurancePct = Math.round((insuranceShare / gross) * 100);
      // Porcentaje de Copago (Paciente)
      patientPct = 100 - insurancePct;
    }

    updates.insurance_percentage = insurancePct;
    updates.patient_percentage = patientPct; // 💡 Actualización del campo patient_percentage

    setData((prevData) => ({
      ...prevData,
      ...updates,
    }));
  };

  return (
    <SideModal
      open={show}
      onClose={() => onClose()}
      title={isEdit ? "Editar Regla de Convenio" : "Nueva Regla de Convenio"}
      description={
        isEdit
          ? `Editando regla #${rule?.id}`
          : "Defina los valores para esta prestación."
      }
      width="4xl"
    >
      <form onSubmit={handleSubmit} className="m-4 space-y-4">
        {/* Vínculos */}
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Servicio/Prestación
            </span>
            <select
              value={data.session_type_id}
              onChange={(e) => setData("session_type_id", e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="">Seleccione Servicio</option>
              {sessionTypes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Base: ${s.base_price_clp?.toLocaleString() || 0})
                </option>
              ))}
            </select>
            {errors.session_type_id && (
              <p className="mt-1 text-xs text-red-500">
                {errors.session_type_id}
              </p>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Plan Aplicable (Opcional)
            </span>
            <select
              value={data.plan_id}
              onChange={(e) => setData("plan_id", e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
            >
              <option value="">(Regla General para Aseguradora)</option>
              {plansList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
            {errors.plan_id && (
              <p className="mt-1 text-xs text-red-500">{errors.plan_id}</p>
            )}
          </label>
        </div>

        {/* Montos */}
        <h3 className="pt-4 text-base font-semibold text-gray-700 border-t">
          Definición de Tarifas (CLP)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Precio Bruto Total */}
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Precio Bruto Total
            </span>
            <input
              type="number"
              min="0"
              value={data.gross_price}
              onChange={(e) => handlePriceChange("gross_price", e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
              required
            />
            {errors.gross_price && (
              <p className="mt-1 text-xs text-red-500">{errors.gross_price}</p>
            )}
          </label>

          {/* Copago (Paciente) en CLP */}
          <label className="block">
            <span className="text-sm font-bold text-red-700">
              Copago (Paciente) CLP
            </span>
            <input
              type="number"
              min="0"
              value={data.patient_share_clp}
              onChange={(e) =>
                handlePriceChange("patient_share_clp", e.target.value)
              }
              className="block w-full mt-1 border-red-300 rounded-md shadow-sm"
              required
            />
            {errors.patient_share_clp && (
              <p className="mt-1 text-xs text-red-500">
                {errors.patient_share_clp}
              </p>
            )}
          </label>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {/* Aporte Aseguradora en CLP */}
          <label className="block">
            <span className="text-sm font-medium text-green-700">
              Aporte Aseguradora CLP
            </span>
            <input
              type="number"
              min="0"
              value={data.insurance_share_clp}
              disabled
              className="block w-full mt-1 border-green-300 rounded-md shadow-sm bg-green-50"
            />
          </label>

          {/* Copago del Paciente en Porcentaje (%) */}
          <label className="block">
            <span className="text-sm font-bold text-red-700">Copago (%)</span>
            <input
              disabled
              type="number"
              min="0"
              max="100"
              value={data.patient_percentage}
              className="block w-full mt-1 border-red-300 rounded-md shadow-sm bg-red-50"
            />
            {errors.patient_percentage && (
              <p className="mt-1 text-xs text-red-500">
                {errors.patient_percentage}
              </p>
            )}
          </label>

          {/* Porcentaje de Cobertura de la Aseguradora (Añadido en un nuevo grupo para más espacio) */}
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Cobertura Aseguradora (%)
            </span>
            <input
              disabled
              type="number"
              min="0"
              max="100"
              value={data.insurance_percentage}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm bg-gray-50"
            />
            {errors.insurance_percentage && (
              <p className="mt-1 text-xs text-red-500">
                {errors.insurance_percentage}
              </p>
            )}
          </label>
        </div>

        {/* Vigencia y Notas */}
        <h3 className="pt-4 text-base font-semibold text-gray-700 border-t">
          Vigencia y Notas
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Fecha de Aplicación (Vigencia)
            </span>
            <input
              type="date"
              value={data.start_date}
              onChange={(e) => setData("start_date", e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
              required
            />
            {errors.start_date && (
              <p className="mt-1 text-xs text-red-500">{errors.start_date}</p>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Fecha de Fin (Opcional, para historial)
            </span>
            <input
              type="date"
              value={data.end_date}
              onChange={(e) => setData("end_date", e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
            />
            {errors.end_date && (
              <p className="mt-1 text-xs text-red-500">{errors.end_date}</p>
            )}
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Notas Internas
          </span>
          <textarea
            rows="2"
            value={data.notes}
            onChange={(e) => setData("notes", e.target.value)}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
          ></textarea>
        </label>

        {/* Botones de Acción */}
        <div className="flex justify-end pt-4 space-x-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            <X className="inline w-4 h-4 mr-1" /> Cancelar
          </button>
          <button
            type="submit"
            disabled={processing}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {processing ? (
              "Guardando..."
            ) : (
              <span className="flex items-center">
                <Save className="w-4 h-4 mr-1" />{" "}
                {isEdit ? "Actualizar Regla" : "Crear Regla"}
              </span>
            )}
          </button>
        </div>
      </form>
    </SideModal>
  );
}
