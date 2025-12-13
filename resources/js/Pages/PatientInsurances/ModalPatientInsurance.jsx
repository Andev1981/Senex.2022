import { useForm } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import SearchSelect from "@/Components/SearchSelect";
import { useEffect, useState } from "react";
import { fmtDate, fmtDateISO, fmtCLP } from "@/utils/utils";
import { t } from "@/constants/translations";

function ModalPatientInsurance({
  patientInsuranceSelected,
  setOpenModalCreateUpdate,
  patients,
  plans,
}) {
  const [plan, setPlan] = useState(
    plans.find((pl) => pl.id == patientInsuranceSelected?.patient_id) || null
  );
  const { data, setData, errors, post, put, reset, processing } = useForm({
    id: patientInsuranceSelected?.id,
    patient_id: patientInsuranceSelected?.patient_id || "",
    insurance_id: patientInsuranceSelected?.insurance_id || "",
    plan_id: patientInsuranceSelected?.plan_id || "",
    member_id: patientInsuranceSelected?.member_id || "",
    start_date: patientInsuranceSelected?.start_date || "",
    end_date: patientInsuranceSelected?.end_date || "",
    status: patientInsuranceSelected?.status || "pending",
    is_primary: patientInsuranceSelected?.is_primary ?? true,
    notes: patientInsuranceSelected?.notes || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (data.id) {
      put(route("agreements.update", data.id), {
        onSuccess: () => {
          reset();
          setOpenModalCreateUpdate(false);
        },
        onError: (errors) => {
          console.log("Errors: ", errors);
        },
      });
    } else {
      post(route("agreements.store"), {
        onSuccess: () => {
          reset();
          setOpenModalCreateUpdate(false);
        },
        onError: (errors) => {
          console.log("Errors: ", errors);
        },
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setData(name, checked);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4 px-4 pt-2">
        {/* Selección de Paciente */}
        <div className="bg-green-50 p-4 rounded-xl shadow-md">
          <SearchSelect
            items={patients}
            value={data?.patient_id}
            onChange={(value) => setData("patient_id", value)}
            config={{
              valueKey: "id",
              displayKey: "full_name",
              secondaryKeys: ["rut"],
              searchKeys: ["full_name", "rut"],
              renderItem: (item) => (
                <div>
                  <p className="font-medium text-gray-900">{item.full_name}</p>
                  <p className="text-xs text-gray-500">RUT: {item.rut}</p>
                  {item.active_treatments?.length > 0 && (
                    <p className="text-xs font-semibold text-blue-600">
                      ✓ Tiene tratamiento activo
                    </p>
                  )}
                </div>
              ),
            }}
            label="Paciente *"
            placeholder="Buscar paciente por nombre o RUT..."
            /* disabled={!isFieldEditable("patient_id")} */
            error={errors.patient_id}
          />
        </div>
        {/* Selección de Paciente */}
        <div className="bg-blue-50 p-4 rounded-xl shadow-md">
          <SearchSelect
            items={plans}
            value={data?.plan_id}
            onChange={(value) => (
              setData("plan_id", value),
              setPlan(plans.find((pl) => pl.id == value)),
              setData("insurance_id", plans.find((pl) => pl.id == value).id)
            )}
            config={{
              valueKey: "id",
              displayKey: "name",
              secondaryKeys: ["rut"],
              renderItem: (item) => (
                <div>
                  <p className="font-medium text-gray-900">
                    {item.name} | {item.insurance.name}
                  </p>
                  <p className="text-xs text-gray-500">CIE (10): {item.code}</p>
                </div>
              ),
            }}
            label="Planes *"
            placeholder="Buscar plan por nombre o CIE..."
            disabled={!data?.patient_id}
            error={errors.plan_id}
          />
        </div>
        <div className="col-span-2 mt-4">
          <PlanDetailsSummary
            plan={plan}
            data={data}
            setData={setData}
            errors={errors}
          />
        </div>

        {data?.id && (
          <div className="col-span-2">
            <div className="flex items-center">
              <input
                id="is_active"
                name="is_active"
                checked={!!data.is_active}
                type="checkbox"
                onChange={handleCheckbox}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="is_active"
                className="ml-2 text-sm text-gray-900 dark:text-gray-300"
              >
                Active
              </label>
            </div>

            <InputError message={errors?.is_active} className="mt-2" />
          </div>
        )}
      </div>

      <hr className="my-4" />
      <div className="flex justify-end gap-3 px-4 my-4">
        <SecondaryButton
          type="button"
          variant="outline"
          onClick={() => {
            reset();
            setOpenModalCreateUpdate(false);
          }}
          disabled={processing}
        >
          Cancel
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={processing}>
          {data.id ? "Actualizar" : "Asignar"}
        </PrimaryButton>
      </div>
    </form>
  );
}

export default ModalPatientInsurance;

const PlanDetailsSummary = ({ plan, data, setData, errors }) => {
  if (!plan) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
        <div className="p-4 bg-indigo-600 text-white">
          <h3 className="text-xl font-bold">
            {/*  {plan.name || "Plan de Tratamiento"} */}
          </h3>
          <p className="text-sm opacity-90 mt-1">
            {/*  ID: {plan.id} | Código: {plan.code || "N/A"} */}
          </p>
        </div>
        <div className="gap-x-8 gap-y-4 p-6 text-center">
          Selecciona un plan para ver los detalles.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
      {/* 🔶 CABECERA DEL PLAN */}
      <div className="p-4 bg-indigo-600 text-white">
        <h3 className="text-xl font-bold">
          {plan.name || "Plan de Tratamiento"} | {plan.insurance.name || ""}
        </h3>
        <p className="text-sm opacity-90 mt-1 uppercase">
          ID: {plan.id} | Código: {plan.code || "N/A"}
        </p>
      </div>

      {/* 📋 CONTENIDO PRINCIPAL EN DOS COLUMNAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-6">
        {/* === COLUMNA IZQUIERDA: GENERAL Y SESIONES === */}
        <div className="space-y-6">
          {/* 1. INFORMACIÓN GENERAL */}
          <div className="p-3 border rounded-lg bg-gray-50">
            <h4 className="text-md font-bold text-gray-700 mb-2">
              Información General
            </h4>
            <DetailRow label="Tipo de Plan" value={t("plan_type", plan.type)} />
            <DetailRow
              label="Porcentaje de Cobertura"
              value={`${plan.coverage_percentage || 0}%`}
            />
            <DetailRow
              label="Meses de Validez"
              value={`${plan.valid_months || "-"} meses`}
            />
            <DetailRow
              label="Descripción"
              value={plan.description}
              className="whitespace-pre-wrap max-w-[60%]"
            />
          </div>

          {/* 2. VALORES */}
          <div className="p-3 border rounded-lg bg-gray-50">
            <h4 className="text-md font-bold text-gray-700 mb-2">
              Valores y Costo
            </h4>
            <DetailRow
              label="Precio Total"
              value={fmtCLP(plan.price)}
              className="text-indigo-600 font-extrabold" // Destacar
            />
          </div>
        </div>

        {/* === COLUMNA DERECHA: SESIONES Y VIGENCIA === */}
        <div className="space-y-6">
          {/* 3. SESIONES */}
          <div className="p-3 border rounded-lg bg-gray-50">
            <h4 className="text-md font-bold text-gray-700 mb-2">Sesiones</h4>
            {plan.type === "unlimited" ? (
              <DetailRow
                label="Sesiones Totales"
                value={`Sin límite de sesiones`}
              />
            ) : (
              <DetailRow
                label="Sesiones Totales"
                value={`${plan.total_sessions || 0} sesiones`}
              />
            )}

            {/* Puedes agregar aquí un campo para sesiones consumidas si existe */}
          </div>

          {/* 4. VIGENCIA */}
          <div className="p-3 border rounded-lg bg-gray-50">
            <h4 className="text-md font-bold text-gray-700 mb-2">Vigencia</h4>
            <DetailRow
              label="Fecha de Inicio"
              value={fmtDate(plan.start_date)}
            />
            <DetailRow
              label="Fecha de Término"
              value={fmtDate(plan.end_date)}
            />
          </div>
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-6">
        {/* Fecha Inicio */}
        <div>
          <label className="block mb-2 text-sm font-bold text-gray-700">
            Fecha Inicio *
          </label>
          <input
            type="date"
            value={fmtDateISO(data.start_date) || ""}
            onChange={(e) => {
              setData("start_date", e.target.value);
            }}
            className={`w-full px-3 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 ${
              errors.date ? "border-red-500" : "border-gray-200"
            }`}
            required
          />
          <InputError message={errors.start_date} />
        </div>
        {/* Fecha Término */}
        <div>
          <label className="block mb-2 text-sm font-bold text-gray-700">
            Fecha Término *
          </label>
          <input
            type="date"
            value={fmtDateISO(data.end_date) || ""}
            onChange={(e) => {
              setData("end_date", e.target.value);
            }}
            className={`w-full px-3 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 ${
              errors.end_date ? "border-red-500" : "border-gray-200"
            }`}
            required
          />
          <InputError message={errors.end_date} />
        </div>
        <div className="col-span-2">
          <label htmlFor="">Notas</label>
          <textarea
            value={data.notes}
            onChange={(e) => {
              setData("notes", e.target.value);
            }}
            className="w-full border-1 border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

// --- Componente Auxiliar para Filas de Detalle ---
const DetailRow = ({ label, value, className = "" }) => (
  <div className="flex justify-between items-start py-1 border-b border-gray-100">
    <span className="text-sm text-gray-500">{label}</span>
    <span
      className={`text-sm font-semibold text-gray-800 text-right ${className}`}
    >
      {value || "-"}
    </span>
  </div>
);
