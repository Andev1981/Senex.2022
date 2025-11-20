import { useForm } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import ChilePhoneInput from "@/Components/ChilePhoneInput";
import RutInput from "@/Components/RutInput";

function HealthInsurerModal({ healthInsurer, setModalOpen }) {
  const { data, setData, errors, post, put, reset, processing } = useForm({
    id: healthInsurer?.id,
    name: healthInsurer?.name || "",
    rut: healthInsurer?.rut || "",
    phone: healthInsurer?.phone || "",
    email: healthInsurer?.email || "",
    address: healthInsurer?.address || "",
    website: healthInsurer?.website || "",
    is_active: healthInsurer?.is_active ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (data.id) {
      put(route("health-insurers.update", data.id), {
        onSuccess: () => {
          setModalOpen(false);
          reset();
        },
        onError: (errors) => {
          console.log("Errors: ", errors);
        },
      });
    } else {
      post(route("health-insurers.store"), {
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
          <InputLabel htmlFor="rut" value="Rut" className="ml-2 text-primary" />
          <RutInput
            initialValue={data?.rut}
            value={data?.rut}
            onChange={(rut) => setData("rut", rut)}
            setRutError={(error) => (errors.rut = error)}
          />
          <InputError message={errors?.rut} className="mt-2" />
        </div>

        <div>
          <InputLabel
            htmlFor="phone"
            value="Teléfono"
            className="ml-2 text-primary"
          />
          <ChilePhoneInput
            initialValue={data?.phone}
            value={data?.phone}
            onChange={(phone) => setData("phone", phone)}
          />
          <InputError message={errors?.phone} className="mt-2" />
        </div>

        <div className="col-span-2">
          <InputLabel
            htmlFor="email"
            value="Email"
            className="ml-2 text-primary"
          />
          <TextInput
            type="email"
            id="email"
            name="email"
            value={data?.email}
            onChange={handleChange}
            className="w-full"
          />
          <InputError message={errors?.email} className="mt-2" />
        </div>

        <div className="col-span-2">
          <InputLabel
            htmlFor="address"
            value="Dirección"
            className="ml-2 text-primary"
          />
          <textarea
            id="address"
            name="address"
            value={data?.address}
            onChange={handleChange}
            rows="3"
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Enter address..."
          />
          <InputError message={errors?.address} className="mt-2" />
        </div>

        <div className="col-span-2">
          <InputLabel
            htmlFor="website"
            value="Sitio Web"
            className="ml-2 text-primary"
          />
          <TextInput
            type="url"
            id="website"
            name="website"
            value={data?.website}
            onChange={handleChange}
            className="w-full"
            placeholder="https://..."
          />
          <InputError message={errors?.website} className="mt-2" />
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
              {data?.is_active ? "Activo" : "Inactivo"}
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
          Cancel
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={processing}>
          {data.id ? "Update" : "Create"}
        </PrimaryButton>
      </div>
    </form>
  );
}

export default HealthInsurerModal;
