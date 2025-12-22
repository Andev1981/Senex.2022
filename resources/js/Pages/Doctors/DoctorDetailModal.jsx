import { useState } from "react";
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
import { especialidadesChile } from "@/constants/especialidades";
import { Building2 } from "lucide-react";

export default function DoctorDetailModal({
  doctor,
  provinces,
  regions,
  communes,
  setIsModalOpenDetail,
}) {
  // Estado para saber si estamos ante un paciente que ya existe en otra sede
  const [isExistingInSystem, setIsExistingInSystem] = useState(false);

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
    mobile_app_access: doctor?.branch?.mobile_app_access || false,
    status: doctor?.branch?.status || "active",
    status_reason: doctor?.branch?.status_reason || "",
    commune_id: doctor?.commune_id || "",
    province_id: doctor?.province_id || "",
    region_id: doctor?.region_id || "",
    street: doctor?.street || "",
    number: doctor?.number || "",
    details: doctor?.details || "",
  });

  // 🎯 FUNCIÓN DE VALIDACIÓN DE RUT
  const handleRutBlur = async (e) => {
    const rut = e.target.value;

    // 🎯 Limpiamos para la API (quitar puntos)
    const cleanRut = rut.replace(/\./g, "");

    // Solo validamos si es un paciente nuevo y el RUT tiene longitud mínima
    if (data.id || cleanRut.length < 8) return;

    try {
      // Llamada al endpoint que creamos en Laravel
      const response = await axios.post(route("doctors.check-existing"), {
        rut: cleanRut,
      });

      if (response.data.status === "exists") {
        const d = response.data.doctor;

        // Cargamos los datos en el formulario
        setData((prev) => ({
          ...prev,
          id: d.id,
          name: d.name,
          last_name: d.last_name,
          email: d.email,
          phone: d.phone,
          birth_date: moment.utc(d.birth_date).format("YYYY-MM-DD"),
          speciality: d.speciality,
          gender: d.gender,
          mobile_app_access: d.mobile_app_access,
          status: d.status,
          status_reason: d.status_reason,
          commune_id: d.commune_id,
          province_id: d.province_id,
          region_id: d.region_id,
          street: d.street,
          number: d.number,
          details: d.details,
        }));

        setIsExistingInSystem(true);
        /* clearErrors(); */ // Limpiamos errores previos si los había
      } else {
        setIsExistingInSystem(false);
      }
    } catch (error) {
      console.error("Error al validar el RUT en el sistema", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (data.status !== "active") {
      setData("mobile_app_access", false);
    }

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
    <form onSubmit={handleSubmit} className="shadow-xl p-2 rounded-lg">
      {/* 🎯 MENSAJE ESTÁTICO DE CABECERA */}
      {isExistingInSystem && (
        <div className="mx-4 mt-2 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700 text-sm flex items-center gap-2 rounded">
          <Building2 className="w-4 h-4" />
          <span>
            Este doctor ya pertenece a la red de clínicas. Al guardar, se
            actualizarán sus datos y se vinculará a esta sucursal.
          </span>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4 px-4 pt-2">
        <div>
          <InputLabel htmlFor="rut" value="Rut" className="ml-2 text-primary" />
          <RutInput
            value={data.rut}
            initialValue={data?.rut}
            onChange={(rut) => setData("rut", rut)}
            setRutError={(error) => (errors.rut = error)}
            onBlur={handleRutBlur} // 🎯 DISPARADOR DE BÚSQUEDA
            disabled={!!data.id} // No se cambia el RUT en edición
          />

          <InputError message={errors?.rut} className="mt-2" />
        </div>
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
            disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
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
            disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
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
            disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
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
            disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
          />

          <InputError message={errors?.phone} className="mt-2" />
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
            disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
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
            disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
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
            disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
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
      </div>
      {/* Estado */}
      <hr className="my-4" />
      <div className="grid grid-cols-2 gap-4 px-4 pt-2">
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
              const newStatus = e.target.value;

              // 1. Actualizamos el estado "status"
              setData("status", newStatus);

              // 2. Usamos una función de callback para hacer la validación inmediatamente DESPUÉS
              // (Inertia/useForm usa callbacks para asegurar la reactividad)
              setData("status", newStatus, {
                onFinish: () => {
                  // Si el nuevo status NO es 'active', forzamos el acceso a false
                  if (newStatus !== "active") {
                    setData("mobile_access_enabled", false); // Usar el nombre de campo correcto
                  }
                  // Si es 'active', NO hacemos nada, respetando la elección del usuario
                },
              });
            }}
            className="rounded-md w-full border-gray-100 shadow-sm focus:border-primary/20 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-primary dark:focus:ring-primary/20 border-[0.5px]"
            required
            disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
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
        {data.status !== "active" ? (
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
                required={data.status !== "active"}
                disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
              />
            </div>
          </div>
        ) : (
          <div>
            <InputLabel
              htmlFor="status"
              value="Acceso Móvil"
              className="mb-2 ml-2 mt-2 text-primary"
            />
            <Switch
              id="mobile_app_access"
              name="mobile_app_access"
              checked={!!data?.mobile_app_access}
              onChange={(e) => {
                const checked = e?.target?.checked ?? false;
                setData("mobile_app_access", checked);
              }}
              disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
            />
            <InputError message={errors.mobile_app_access} className="mt-2" />
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
            disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
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
            disabled={!data.region_id || isExistingInSystem}
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
            disabled={!data.province_id || isExistingInSystem}
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
            disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
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
            disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
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
            disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
          />
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
          {data.id || isExistingInSystem
            ? "Actualizar y Vincular"
            : "Crear Paciente"}
        </PrimaryButton>
      </div>
    </form>
  );
}
