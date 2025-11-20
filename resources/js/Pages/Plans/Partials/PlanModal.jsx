import { useForm } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import InputPesoChileno from "@/Components/InputPesoChileno";

export default function PlanModal({
  plan,
  setModalOpen,
  healthInsurers,
  insuranceCompanies,
  sessionTypes,
}) {
  const { data, setData, errors, post, put, reset, processing } = useForm({
    id: plan?.id,
    name: plan?.name || "",
    codigo: plan?.codigo || "",
    institution_type: plan?.institution_type || "clinic",
    institution_id: plan?.institution_id || null,
    type: plan?.type || "",
    total_sessions: plan?.total_sessions || "",
    price: plan?.price || 0,
    valid_months: plan?.valid_months || "",
    session_types: plan?.session_types || [],
    description: plan?.description || "",
    coverage: plan?.coverage || "",
    is_active: plan?.is_active ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (data.id) {
      put(route("plans.update", data.id), {
        onSuccess: () => {
          setModalOpen(false);
          reset();
        },
        onError: (errors) => {
          console.log("Errors: ", errors);
        },
      });
    } else {
      post(route("plans.store"), {
        onSuccess: () => {
          setModalOpen(false);
          reset();
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

  const handleSessionTypesChange = (e) => {
    const options = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setData("session_types", options);
  };

  const institutions =
    data.institution_type === "health_insurer"
      ? healthInsurers
      : data.institution_type === "insurance_company"
      ? insuranceCompanies
      : [];

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4 px-4 pt-2">
        <div className="col-span-2">
          <InputLabel
            htmlFor="name"
            value="Nombre"
            className="ml-2 text-primary"
          />
          <TextInput
            type="text"
            id="name"
            name="name"
            value={data?.name}
            onChange={handleChange}
            required
            className="w-full"
          />
          <InputError message={errors?.name} className="mt-2" />
        </div>

        <div>
          <InputLabel
            htmlFor="codigo"
            value="Código"
            className="ml-2 text-primary"
          />
          <TextInput
            type="text"
            id="codigo"
            name="codigo"
            value={data?.codigo}
            onChange={handleChange}
            required
            className="w-full"
          />
          <InputError message={errors?.codigo} className="mt-2" />
        </div>

        <div>
          <InputLabel
            htmlFor="type"
            value="Tipo de Plan"
            className="ml-2 text-primary"
          />
          <select
            id="type"
            name="type"
            value={data?.type}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary"
            required
          >
            <option value="">--Seleccionar--</option>
            <option value="annual">Anual</option>
            <option value="session_pack">Pack de Sesiones</option>
            <option value="unlimited">Ilimitado</option>
          </select>
          <InputError message={errors?.type} className="mt-2" />
        </div>

        <div>
          <InputLabel
            htmlFor="institution_type"
            value="Tipo de Institución"
            className="ml-2 text-primary"
          />
          <select
            id="institution_type"
            name="institution_type"
            value={data?.institution_type}
            onChange={(e) => {
              handleChange(e);
              setData("institution_id", ""); // Reset institution_id when type changes
            }}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary"
            required
          >
            <option value="">--Seleccionar--</option>
            <option value="clinic">Clínica</option>
            <option value="health_insurer">Isapre</option>
            <option value="insurance_company">Aseguradora</option>
          </select>
          <InputError message={errors?.institution_type} className="mt-2" />
        </div>

        {data.institution_type !== "clinic" && (
          <div>
            <InputLabel
              htmlFor="institution_id"
              value="Institución"
              className="ml-2 text-primary"
            />
            <select
              id="institution_id"
              name="institution_id"
              value={data?.institution_id || ""}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary"
              required={data.institution_type !== "clinic"}
              disabled={data.institution_type === "clinic"}
            >
              <option value="">--Seleccionar--</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
            </select>
            <InputError message={errors?.institution_id} className="mt-2" />
          </div>
        )}

        {data.type !== "unlimited" && (
          <div>
            <InputLabel
              htmlFor="total_sessions"
              value="Total de Sesiones"
              className="ml-2 text-primary"
            />
            <TextInput
              type="number"
              id="total_sessions"
              name="total_sessions"
              value={data?.total_sessions}
              onChange={handleChange}
              className="w-full"
              min="0"
            />
            <InputError message={errors?.total_sessions} className="mt-2" />
          </div>
        )}

        <div>
          <InputLabel
            htmlFor="price"
            value="Precio"
            className="ml-2 text-primary"
          />
          <InputPesoChileno
            name="price"
            price={data?.price}
            onChange={handleChange}
            required
            className="w-full"
          />
          <InputError message={errors?.price} className="mt-2" />
        </div>

        <div>
          <InputLabel
            htmlFor="valid_months"
            value="Vigencia (Meses)"
            className="ml-2 text-primary"
          />
          <TextInput
            type="number"
            id="valid_months"
            name="valid_months"
            value={data?.valid_months}
            onChange={handleChange}
            className="w-full"
            min="0"
          />
          <InputError message={errors?.valid_months} className="mt-2" />
        </div>

        {sessionTypes && sessionTypes.length > 0 && (
          <div className="col-span-2">
            <InputLabel
              htmlFor="session_types"
              value="Tipos de Sesión Permitidos"
              className="ml-2 text-primary"
            />
            <select
              id="session_types"
              name="session_types"
              multiple
              value={data?.session_types}
              onChange={handleSessionTypesChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary"
              size="4"
            >
              {sessionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Mantén presionado Ctrl/Cmd para seleccionar múltiples opciones
            </p>
            <InputError message={errors?.session_types} className="mt-2" />
          </div>
        )}

        <div className="col-span-2">
          <InputLabel
            htmlFor="description"
            value="Descripción"
            className="ml-2 text-primary"
          />
          <textarea
            id="description"
            name="description"
            value={data?.description}
            onChange={handleChange}
            rows="3"
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Descripción del plan..."
          />
          <InputError message={errors?.description} className="mt-2" />
        </div>

        <div className="col-span-2">
          <InputLabel
            htmlFor="coverage"
            value="Cobertura"
            className="ml-2 text-primary"
          />
          <textarea
            id="coverage"
            name="coverage"
            value={data?.coverage}
            onChange={handleChange}
            rows="3"
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Detalles de cobertura..."
          />
          <InputError message={errors?.coverage} className="mt-2" />
        </div>

        <div className="col-span-2">
          <div className="flex items-center">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={data?.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="is_active"
              className="ml-2 text-sm text-gray-900 dark:text-gray-300"
            >
              Activo
            </label>
          </div>
          <InputError message={errors?.is_active} className="mt-2" />
        </div>
      </div>

      <hr className="my-4" />
      <div className="flex justify-end gap-3 px-4 my-4">
        <SecondaryButton
          type="button"
          variant="outline"
          onClick={() => {
            reset();
            setModalOpen(false);
          }}
          disabled={processing}
        >
          Cancelar
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={processing}>
          {data.id ? "Actualizar" : "Crear"}
        </PrimaryButton>
      </div>
    </form>
  );
}
