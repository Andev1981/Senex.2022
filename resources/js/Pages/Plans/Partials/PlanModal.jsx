import { useForm, usePage } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import InputPesoChileno from "@/Components/InputPesoChileno";

export default function PlanModal({ plan, setModalOpen, insurance }) {
  const { props } = usePage();

  const currentCompanyId = props.current_company_id;

  const { data, setData, errors, post, put, reset, processing } = useForm({
    id: plan?.id,
    company_id: currentCompanyId,
    name: plan?.name || "",
    code: plan?.code || "",
    insurance_id: plan?.insurance_id || insurance?.id,
    coverage_percentage: plan?.coverage_percentage || "",
    type: plan?.type || "",
    total_sessions: plan?.total_sessions || "",
    price: plan?.price || 0,
    valid_months: plan?.valid_months || "",
    start_date: plan?.start_date || "",
    end_date: plan?.end_date || "",
    description: plan?.description || "",
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
            htmlFor="code"
            value="Código"
            className="ml-2 text-primary"
          />
          <TextInput
            type="text"
            id="code"
            name="code"
            value={data?.code}
            onChange={handleChange}
            required
            className="w-full"
          />
          <InputError message={errors?.code} className="mt-2" />
        </div>

        <div>
          <InputLabel
            htmlFor="coverage_percentage"
            value="Porcentage"
            className="ml-2 text-primary"
          />
          <TextInput
            type="number"
            id="coverage_percentage"
            name="coverage_percentage"
            value={data?.coverage_percentage}
            onChange={handleChange}
            required
            className="w-full"
          />
          <InputError message={errors?.coverage_percentage} className="mt-2" />
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

        <div>
          <InputLabel
            htmlFor="start_date"
            value="Fecha Inicio"
            className="ml-2 text-primary"
          />
          <TextInput
            type="date"
            id="start_date"
            name="start_date"
            value={data?.start_date}
            onChange={handleChange}
            className="w-full"
            min="0"
          />
          <InputError message={errors?.start_date} className="mt-2" />
        </div>

        <div>
          <InputLabel
            htmlFor="end_date"
            value="Fecha Término"
            className="ml-2 text-primary"
          />
          <TextInput
            type="date"
            id="end_date"
            name="end_date"
            value={data?.end_date}
            onChange={handleChange}
            className="w-full"
            min="0"
          />
          <InputError message={errors?.end_date} className="mt-2" />
        </div>

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
