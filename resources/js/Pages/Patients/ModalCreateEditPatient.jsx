import { useForm } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import TextInputNumber from "@/Components/TextInputNumber";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import ChilePhoneInput from "@/Components/ChilePhoneInput";
import RutInput from "@/Components/RutInput";
import moment from "moment";

export default function ModalCreateEditPatient({
  patient,
  setOpenModalPatient,
  communes,
  regions,
  provinces,
}) {
  const { data, setData, errors, post, put, reset, processing } = useForm({
    id: patient?.id || null,
    name: patient?.name || "",
    last_name: patient?.last_name || "",
    email: patient?.email || "",
    rut: patient?.rut || "",
    birth_date: patient?.birth_date
      ? moment.utc(patient.birth_date).format("YYYY-MM-DD")
      : moment.utc(Date.now()).format("YYYY-MM-DD"),
    gender: patient?.gender || "",
    occupation: patient?.occupation || "",
    marital_status: patient?.marital_status || "",
    status: patient?.status || "active",
    status_reason: patient?.status_reason || "",
    phone: patient?.phone || "",
    street: patient?.street || "",
    number: patient?.number || "",
    details: patient?.details || "",
    commune_id: patient?.commune_id || "",
    province_id: patient?.province_id || "",
    region_id: patient?.region_id || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const opts = {
      preserveState: (page) => Object.keys(page.props.errors || {}).length > 0,
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setOpenModalPatient(false);
      },
      onError: () => {
        // Mantener modal abierto (no lo cierres aquí)
        // Opcional: enfocar el primer campo con error
        const firstErrorName = Object.keys(errors || {})[0];
        if (firstErrorName) {
          const el = document.querySelector(`[name="${firstErrorName}"]`);
          el?.focus?.();
        }
      },
    };

    if (data.id) {
      // usa PUT/PATCH si tu ruta es resourceful
      // put(route('pacientes.update', data.id), opts);
      post(route("pacientes.update", data.id), opts); // si tu ruta acepta POST con _method
    } else {
      post(route("pacientes.store"), opts);
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const filteredProvinces = provinces?.filter(
    (prov) => prov.region_id === parseInt(data.region_id)
  );

  const filteredCommunes = communes?.filter(
    (com) => com.province_id === parseInt(data.province_id)
  );
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-3 gap-4 px-4 pt-2">
        <div>
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
            onChange={(e) => handleChange(e)}
            required
            className="w-full"
          />
          <InputError message={errors?.name} className="mt-2" />
        </div>
        <div>
          <InputLabel
            htmlFor="last_name"
            value="Apellido"
            className="ml-2 text-primary"
          />
          <TextInput
            type="text"
            id="last_name"
            name="last_name"
            value={data?.last_name}
            onChange={(e) => handleChange(e)}
            required
            className="w-full"
          />
          <InputError message={errors?.last_name} className="mt-2" />
        </div>

        <div>
          <InputLabel
            htmlFor="email"
            value="Email"
            className="ml-2 text-primary"
          />
          <TextInput
            type="text"
            id="email"
            name="email"
            value={data?.email}
            onChange={(e) => handleChange(e)}
            required
            className="w-full"
          />
          <InputError message={errors?.email} className="mt-2" />
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
            htmlFor="fecha"
            value="Fecha"
            className="ml-2 text-primary"
          />
          <TextInput
            type="date"
            id="birth_date"
            name="birth_date"
            value={data?.birth_date}
            onChange={(e) => handleChange(e)}
            required
            className="w-full"
          />
          <InputError message={errors?.birth_date} className="mt-2" />
        </div>
        <div>
          <InputLabel
            htmlFor="occupation"
            value="Ocupación"
            className="ml-2 text-primary"
          />
          <TextInput
            type="text"
            id="occupation"
            name="occupation"
            value={data?.occupation}
            onChange={(e) => handleChange(e)}
            required
            className="w-full"
          />
          <InputError message={errors?.occupation} className="mt-2" />
        </div>
        <div>
          <InputLabel
            htmlFor="gender"
            value="Sexo"
            className="ml-2 text-primary"
          />
          <select
            id="gender"
            name="gender"
            value={data.gender}
            onChange={(e) => {
              setData("gender", e.target.value);
            }}
            className="rounded-md w-full border-gray-100 shadow-sm focus:border-primary/20 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-primary dark:focus:ring-primary/20 border-[0.5px]"
            required
          >
            {!data.gender && <option value="">-- Sexo --</option>}

            <option key={"female"} value={"female"}>
              Femenino
            </option>
            <option key={"male"} value={"male"}>
              Masculino
            </option>
            <option key={"other"} value={"other"}>
              Otro
            </option>
          </select>
          <InputError message={errors.gender} className="mt-2" />
        </div>
        <div>
          <InputLabel
            htmlFor="marital_status"
            value="Estado civil"
            className="ml-2 text-primary"
          />
          <select
            id="marital_status"
            name="marital_status"
            value={data.marital_status}
            onChange={(e) => {
              setData("marital_status", e.target.value);
            }}
            className="rounded-md w-full border-gray-100 shadow-sm focus:border-primary/20 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-primary dark:focus:ring-primary/20 border-[0.5px]"
            required
          >
            {!data.marital_status && (
              <option value="">-- Estado civil --</option>
            )}

            <option key={"single"} value={"single"}>
              Soltero/a
            </option>
            <option key={"married"} value={"married"}>
              Casado/a
            </option>
            <option key={"divorced"} value={"divorced"}>
              Divorciado/a
            </option>
            <option key={"widowed"} value={"widowed"}>
              Viudo/a
            </option>
            <option key={"cohabiting"} value={"cohabiting"}>
              Conviviente
            </option>
          </select>
          <InputError message={errors.gender} className="mt-2" />
        </div>
        <div>
          <InputLabel
            htmlFor="status"
            value="Estado"
            className="ml-2 text-primary"
          />
          <select
            id="status"
            name="status"
            value={data.status}
            onChange={(e) => {
              setData("status", e.target.value);
            }}
            className="rounded-md w-full border-gray-100 shadow-sm focus:border-primary/20 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-primary dark:focus:ring-primary/20 border-[0.5px]"
            required
          >
            {!data.status && <option value="">-- Estado --</option>}

            <option key={"active"} value={"active"}>
              Activo
            </option>
            <option key={"suspended"} value={"suspended"}>
              Suspendido
            </option>
            <option key={"cancelled"} value={"cancelled"}>
              Cancelado
            </option>
          </select>
          <InputError message={errors.status} className="mt-2" />
        </div>
      </div>
      <hr className="my-4" />
      {/* Dirección */}

      {/* Comuna (ya la tienes, solo ajusta source) */}

      <div className="grid grid-cols-2 gap-4 px-4 pt-2">
        {/* Región */}
        <div>
          <InputLabel
            htmlFor="region_id"
            value="Región"
            className="ml-2 text-primary"
          />
          <select
            id="region_id"
            name="region_id"
            value={data.region_id}
            onChange={(e) => {
              setData("region_id", e.target.value);
              setData("province_id", ""); // reset provincia
              setData("commune_id", ""); // reset comuna
            }}
            className="rounded-md w-full border-gray-100 shadow-sm focus:border-primary/20 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-primary dark:focus:ring-primary/20 border-[0.5px]"
            required
          >
            {!data.region_id && <option value="">-- Región --</option>}
            {regions?.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
          <InputError message={errors.region_id} className="mt-2" />
        </div>
        {/* Provincia */}
        <div>
          <InputLabel
            htmlFor="province_id"
            value="Provincia"
            className="ml-2 text-primary"
          />
          <select
            id="province_id"
            name="province_id"
            value={data.province_id}
            onChange={(e) => {
              setData("province_id", e.target.value);
              setData("commune_id", ""); // reset comuna
            }}
            className="rounded-md w-full border-gray-100 shadow-sm focus:border-primary/20 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-primary dark:focus:ring-primary/20 border-[0.5px]"
            required
            disabled={!data.region_id}
          >
            {!data.province_id && <option value="">-- Provincia --</option>}
            {filteredProvinces?.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.name}
              </option>
            ))}
          </select>
          <InputError message={errors.province_id} className="mt-2" />
        </div>
        <div>
          <InputLabel
            htmlFor="commune_id"
            value="Comuna"
            className="ml-2 text-primary"
          />
          <select
            id="commune_id"
            name="commune_id"
            value={data.commune_id}
            onChange={(e) => setData("commune_id", e.target.value)}
            className="rounded-md w-full border-gray-100 shadow-sm focus:border-primary/20 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-primary dark:focus:ring-primary/20 border-[0.5px]"
            required
            disabled={!data.province_id}
          >
            {!data.commune_id && <option value="">-- Comuna --</option>}
            {filteredCommunes?.map((comuna) => (
              <option key={comuna.id} value={comuna.id}>
                {comuna.name}
              </option>
            ))}
          </select>
          <InputError message={errors.commune_id} className="mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 px-4 pt-2">
        <div>
          <InputLabel
            htmlFor="street"
            value="Calle"
            className="ml-2 text-primary"
          />
          <TextInput
            type="text"
            id="street"
            name="street"
            value={data?.street}
            onChange={(e) => handleChange(e)}
            className="w-full"
          />
          <InputError message={errors?.street} className="mt-2" />
        </div>

        <div>
          <InputLabel
            htmlFor="number"
            value="Numeración"
            className="ml-2 text-primary"
          />
          <TextInputNumber
            type="number"
            id="number"
            name="number"
            value={data?.number}
            onChange={(e) => handleChange(e)}
            className="w-full"
          />
          <InputError message={errors?.number} className="mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 px-4 pt-2">
        <div>
          <InputLabel
            htmlFor="details"
            value="Detalles de la Dirección"
            className="ml-2 text-primary"
          />
          <textarea
            id="details"
            name="details"
            value={data?.details}
            onChange={(e) => setData("details", e.target.value)}
            rows="4"
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Ingrese detalles de la dirección..."
          ></textarea>
          <InputError message={errors?.details} className="mt-2" />
        </div>
      </div>
      <hr className="mt-4" />
      <div className="flex justify-end gap-3 px-4 my-4">
        <SecondaryButton
          type="button"
          variant="outline"
          onClick={() => (reset(), setOpenModalPatient(false))}
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
