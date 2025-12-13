import { useForm } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import TextInputNumber from "@/Components/TextInputNumber";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import ChilePhoneInput from "@/Components/ChilePhoneInput";
import RutInput from "@/Components/RutInput";
import Switch from "@/Components/Switch";
import moment from "moment";
import { useEffect } from "react";
import { especialidadesChile } from "@/constants/especialidades";

export default function DoctorDetailModal({
  doctor,
  provinces,
  regions,
  communes,
  setIsModalOpenDetail,
}) {
  const { data, setData, errors, post, put, reset, processing } = useForm({
    id: doctor?.id || null,
    name: doctor?.name || "",
    last_name: doctor?.last_name || "",
    rut: doctor?.rut || "",
    email: doctor?.email || "",
    phone: doctor?.phone || "",
    speciality: doctor?.speciality || "",
    birth_date: doctor?.birth_date
      ? moment.utc(doctor.birth_date).format("YYYY-MM-DD")
      : moment.utc(Date.now()).format("YYYY-MM-DD"),
    gender: doctor?.gender || "",
    mobile_access_enabled: doctor?.mobile_access_enabled || false,
    status: doctor?.status || "active",
    status_reason: doctor?.status_reason || "",
    street: doctor?.street || "",
    number: doctor?.number || "",
    details: doctor?.details || "",
    commune_id: doctor?.commune_id || "",
    province_id: doctor?.province_id || "",
    region_id: doctor?.region_id || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const opts = {
      preserveState: (page) => Object.keys(page.props.errors || {}).length > 0,
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setIsModalOpenDetail(false);
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
      put(route("doctors.update", data.id), opts); // si tu ruta acepta POST con _method
    } else {
      post(route("doctors.store"), opts);
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
            value={data.phone}
            initialValue={data.phone}
            onChange={(phone) => setData("phone", phone)}
          />

          <InputError message={errors?.phone} className="mt-2" />
        </div>
        <div>
          <InputLabel htmlFor="rut" value="Rut" className="ml-2 text-primary" />
          <RutInput
            value={data.rut}
            initialValue={data?.rut}
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

        {/* Especialidades */}
        <div>
          <InputLabel
            htmlFor="speciality"
            value="Especialidad"
            className="ml-2 text-primary"
          />
          <select
            id="speciality"
            name="speciality"
            value={data.speciality}
            onChange={(e) => {
              setData("speciality", e.target.value);
            }}
            className="rounded-md w-full border-gray-100 shadow-sm focus:border-primary/20 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-primary dark:focus:ring-primary/20 border-[0.5px]"
            required
          >
            {!data.speciality && <option value="">-- Especialidad --</option>}
            {especialidadesChile?.map((esp) => (
              <option key={esp} value={esp}>
                {esp}
              </option>
            ))}
          </select>
          <InputError message={errors.speciality} className="mt-2" />
        </div>

        {/* Género */}
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
        {/* Acceso App */}
        <div>
          <InputLabel
            htmlFor="status"
            value="Acceso Móvil"
            className="mb-2 ml-2 text-primary"
          />
          <Switch
            id="mobile_access_enabled"
            name="mobile_access_enabled"
            checked={!!data?.mobile_access_enabled}
            onChange={(e) => {
              const checked = e?.target?.checked ?? false;
              setData("mobile_access_enabled", checked);
            }}
          />
          <InputError message={errors.mobile_access_enabled} className="mt-2" />
        </div>
      </div>
      {/* Estado */}
      <hr className="my-4" />
      <div className="grid grid-cols-3 gap-4 px-4 pt-2">
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
        {data.status !== "active" && (
          <div className="col-span-3">
            <div>
              <InputLabel htmlFor="status_reason" value="Motivo del estado" />
              <TextInput
                type="text"
                id="status_reason"
                name="status_reason"
                value={data?.status_reason}
                onChange={(e) => setData("status_reason", e.target.value)}
                rows="4"
              />
            </div>
          </div>
        )}
      </div>

      <hr className="my-4" />
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
          onClick={() => (reset(), setIsModalOpenDetail(false))}
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
