import { useForm } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import ChilePhoneInput from "@/Components/ChilePhoneInput";
import RutInput from "@/Components/RutInput";

function ModalPlans({ plans, setModalOpen, setOpneModalPlans }) {
  const { data, setData, errors, post, put, reset, processing } = useForm({
    id: insurance?.id,
    name: insurance?.name || "",
    rut: insurance?.rut || "",
    phone: insurance?.phone || "",
    email: insurance?.email || "",
    address: insurance?.address || "",
    website: insurance?.website || "",
    is_active: insurance?.is_active ?? true,
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

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4 px-4 pt-2">
        <div className="col-span-2">
          <InputLabel
            htmlFor="name"
            value="Name"
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
              Active
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

export default ModalInsurance;
