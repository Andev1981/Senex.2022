import { useState } from "react";
import { useForm } from "@inertiajs/react";
import axios from "axios"; // 🎯 Importamos axios
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import ChilePhoneInput from "@/Components/ChilePhoneInput";
import RutInput from "@/Components/RutInput";
import moment from "moment";
import { Building2 } from "lucide-react";
import { handleServerErrors } from "@/utils/FormHelpers";
import Swal from "sweetalert2";
import usePatientStore from "@/Stores/usePatientStore";

export default function ModalCreateEditPatient({
  patient,
  setOpenModalPatient,
  communes,
  regions,
  provinces,
  address = [],
}) {
  // Estado para saber si estamos ante un paciente que ya existe en otra sede
  const [isExistingInSystem, setIsExistingInSystem] = useState(false);
  const addPatient = usePatientStore((state) => state.addPatient);

  const { data, setData, errors, setError, clearErrors, reset, processing } =
    useForm({
      id: patient?.id || "",
      branch_id: "",
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
      opt_out_reminders: patient?.opt_out_reminders || false, // Por defecto quiere recibir
      prefers_whatsapp: patient?.prefers_whatsapp || true, // Recomendado por defecto en Chile
      prefers_mail: patient?.prefers_mail || true,
      prefers_sms: patient?.prefers_sms || false,
      require_tutor: patient?.require_tutor || false,
      guardian_name: patient?.contact?.name,
      guardian_relationship: patient?.contact?.relationship,
      guardian_phone: patient?.contact?.phone,
      guardian_email: patient?.contact?.email,
      guardian_rut: patient?.contact?.rut,
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
      const response = await axios.post(route("patients.check-existing"), {
        rut: cleanRut,
      });

      if (response.data.status === "exists") {
        const p = response.data.patient;

        // Cargamos los datos en el formulario
        setData((prev) => ({
          ...prev,
          id: p.id,
          name: p.name,
          last_name: p.last_name,
          email: p.email,
          phone: p.phone,
          birth_date: moment.utc(p.birth_date).format("YYYY-MM-DD"),
          gender: p.gender,
          occupation: p.occupation,
          marital_status: p.marital_status,
        }));

        setIsExistingInSystem(true);
        clearErrors(); // Limpiamos errores previos si los había
      } else {
        setIsExistingInSystem(false);
      }
    } catch (error) {
      console.error("Error al validar el RUT en el sistema");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors(); // Limpiar errores previos

    try {
      const url = data.id
        ? route("patients.update", data.id)
        : route("patients.store");
      const method = data.id ? "patch" : "post";

      const response = await axios[method](url, data);

      console.log("Dato que llega de Axios:", response.data.patient.status);
      console.log("Tipo de dato:", typeof response.data.patient.status);

      console.log(
        "Dato que llega de Axios:",
        response.data.patient.payment_status
      );
      console.log("Tipo de dato:", typeof response.data.patient.payment_status);

      // --- FLUJO DE ÉXITO ---
      const newPatient = response.data.patient;

      // 1. Cerramos el modal de creación
      setOpenModalPatient(false);
      reset();

      // 2. Lanzamos el modal de opciones
      Swal.fire({
        title: "¡Operación Exitosa!",
        text: `El paciente ${newPatient?.name} ha sido guardado. ¿Qué deseas hacer ahora?`,
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "🚀 Crear Atención",
        cancelButtonText: "Cerrar y volver",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#6e7881",
      }).then((result) => {
        if (result.isConfirmed) {
          // Redirigimos a la creación de atención con el ID
          // Si usas Inertia para navegar:
          router.visit(
            route("atenciones.create", { patient_id: newPatient?.id })
          );
        } else {
          //Uso de Estado Global de pacientes con librería zustand
          addPatient(response.data.patient);
        }
      });
    } catch (error) {
      // USO DEL HELPER:
      const isValidationError = handleServerErrors(error, setError);

      if (!isValidationError) {
        // Error genérico (500, 403, etc)
        Swal.fire(
          "Error",
          "Ocurrió un error inesperado en el servidor.",
          "error"
        );
      }
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

  const options = [
    { value: "madre", label: "Madre" },
    { value: "padre", label: "Padre" },
    { value: "hijo", label: "Hijo" },
    { value: "hija", label: "Hija" },
    { value: "hermano", label: "Hermano" },
    { value: "hermana", label: "Hermana" },
    { value: "abuelo", label: "Abuelo" },
    { value: "abuela", label: "Abuela" },
    { value: "nieto", label: "Nieto" },
    { value: "nieta", label: "Nieta" },
    { value: "tio", label: "Tío" },
    { value: "tia", label: "Tía" },
    { value: "sobrino", label: "Sobrino" },
    { value: "sobrina", label: "Sobrina" },
    { value: "primo", label: "Primo" },
    { value: "prima", label: "Prima" },
    { value: "conyuge", label: "Cónyuge" },
    { value: "pareja", label: "Pareja / Conviviente" },
    { value: "cuñado", label: "Cuñado" },
    { value: "cuñada", label: "Cuñada" },
    { value: "suegro", label: "Suegro" },
    { value: "suegra", label: "Suegra" },
    { value: "yerno", label: "Yerno" },
    { value: "nuera", label: "Nuera" },
    { value: "tutor", label: "Tutor / Apoderado" },
    { value: "amigo", label: "Amigo" },
    { value: "amiga", label: "Amiga" },
    { value: "vecino", label: "Vecino" },
    { value: "vecina", label: "Vecina" },
    { value: "cuidador", label: "Cuidador" },
    { value: "cuidadora", label: "Cuidadora" },
    { value: "otro", label: "Otro" },
  ];

  return (
    <form onSubmit={handleSubmit}>
      {/* 🎯 MENSAJE ESTÁTICO DE CABECERA */}
      {isExistingInSystem && (
        <div className="flex items-center gap-2 p-3 mx-4 mt-2 text-sm text-blue-700 border-l-4 border-blue-500 rounded bg-blue-50">
          <Building2 className="w-4 h-4" />
          <span>
            Este paciente ya pertenece a la red de clínicas. Al guardar, se
            actualizarán sus datos y se vinculará a esta sucursal.
          </span>
        </div>
      )}
      <label className="flex items-center p-3 mx-4 space-x-3 border rounded-md bg-gray-50">
        <input
          type="checkbox"
          checked={data.require_tutor ?? ""}
          onChange={(e) => setData("require_tutor", e.target.checked)}
          className="text-indigo-600 rounded "
        />
        <span className="text-sm font-medium">
          El paciente es menor de edad o posee un tutor responsable
        </span>
      </label>
      <div className="grid grid-cols-3 gap-4 px-4 pt-2">
        <div>
          <InputLabel htmlFor="rut" value="Rut" className="ml-2 text-primary" />
          <RutInput
            initialValue={data?.rut ?? ""}
            value={data?.rut}
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
            value={data?.name ?? ""}
            onChange={(e) => handleChange(e)}
            required={!data?.require_tutor}
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
            value={data?.last_name ?? ""}
            onChange={(e) => handleChange(e)}
            required={!data?.require_tutor}
            className="w-full"
            disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
          />
          <InputError message={errors?.last_name} className="mt-2" />
        </div>

        <div>
          <InputLabel
            htmlFor="fecha"
            value="Fecha de Nacimiento"
            className="ml-2 text-primary"
          />
          <TextInput
            type="date"
            id="birth_date"
            name="birth_date"
            value={data?.birth_date ?? ""}
            onChange={(e) => handleChange(e)}
            required={!data?.require_tutor}
            className="w-full"
            disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
          />
          <InputError message={errors?.birth_date} className="mt-2" />
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
            value={data.gender ?? ""}
            onChange={(e) => {
              setData("gender", e.target.value);
            }}
            disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
            className="rounded-md w-full border-gray-100 shadow-sm focus:border-primary/20 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-primary dark:focus:ring-primary/20 border-[0.5px]"
            required={!data?.require_tutor}
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
        {!data?.require_tutor && (
          <div>
            <InputLabel
              htmlFor="marital_status"
              value="Estado civil"
              className="ml-2 text-primary"
            />
            <select
              id="marital_status"
              name="marital_status"
              value={data.marital_status ?? ""}
              onChange={(e) => {
                setData("marital_status", e.target.value);
              }}
              className="rounded-md w-full border-gray-100 shadow-sm focus:border-primary/20 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-primary dark:focus:ring-primary/20 border-[0.5px]"
              required={!data?.require_tutor}
              disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
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
        )}
      </div>

      {!data?.require_tutor && (
        <div className="grid grid-cols-3 gap-4 px-4 pt-2">
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
              value={data?.occupation ?? ""}
              onChange={(e) => handleChange(e)}
              required={!data?.require_tutor}
              className="w-full"
              disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
            />
            <InputError message={errors?.occupation} className="mt-2" />
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
              value={data?.email ?? ""}
              onChange={(e) => handleChange(e)}
              required={!data?.require_tutor}
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
              initialValue={data?.phone ?? ""}
              value={data?.phone ?? ""}
              onChange={(phone) => setData("phone", phone)}
              disabled={isExistingInSystem} // 🎯 BLOQUEAR SI YA EXISTE
              required={!data?.require_tutor}
            />
            <InputError message={errors?.phone} className="mt-2" />
          </div>
        </div>
      )}

      {patient && (
        <>
          <hr className="mt-4" />
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
                value={data.status ?? ""}
                onChange={(e) => {
                  setData("status", e.target.value);
                }}
                className="rounded-md w-full border-gray-100 shadow-sm focus:border-primary/20 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-primary dark:focus:ring-primary/20 border-[0.5px]"
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
          {data.status !== "active" && (
            <div className="grid grid-cols-1 gap-4 px-4 pt-2">
              <div>
                <InputLabel htmlFor="status_reason" value="Motivo del estado" />
                <TextInput
                  type="text"
                  id="status_reason"
                  name="status_reason"
                  value={data?.status_reason ?? ""}
                  onChange={(e) => setData("status_reason", e.target.value)}
                  rows="4"
                />
              </div>
            </div>
          )}
        </>
      )}

      <div className="p-4">
        {data?.require_tutor && (
          <div className="p-4 space-y-4 rounded-md bg-blue-50">
            <h4 className="text-sm font-bold">Datos del Tutor / Responsable</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <InputLabel
                  htmlFor="guardian_rut"
                  value="Rut Tutor"
                  className="ml-2 text-primary"
                />
                <RutInput
                  name="guardian_rut"
                  id="guardian_rut"
                  initialValue={data?.guardian_rut ?? ""}
                  value={data?.guardian_rut}
                  onChange={(guardian_rut) =>
                    setData("guardian_rut", guardian_rut)
                  }
                  onBlur={() => {}}
                  setRutError={(error) => (errors.guardian_rut = error)}
                  disabled={!data.require_tutor} // No se cambia el RUT en edición
                />
                <InputError message={errors?.guardian_rut} className="mt-2" />
              </div>
              <div>
                <InputLabel
                  htmlFor="guardian_name"
                  value="Nombre"
                  className="ml-2 text-primary"
                />
                <TextInput
                  type="text"
                  id="guardian_name"
                  name="guardian_name"
                  value={data?.guardian_name ?? ""}
                  onChange={(e) => handleChange(e)}
                  required={!data?.require_tutor}
                  className="w-full"
                />
                <InputError message={errors?.guardian_name} className="mt-2" />
              </div>

              <div>
                <InputLabel
                  htmlFor="guardian_email"
                  value="Email para Boletas"
                  className="ml-2 text-primary"
                />
                <TextInput
                  type="text"
                  id="guardian_email"
                  name="guardian_email"
                  value={data?.guardian_email ?? ""}
                  onChange={(e) => handleChange(e)}
                  required={!data?.require_tutor}
                  className="w-full"
                />
                <InputError message={errors?.guardian_email} className="mt-2" />
              </div>
              <div>
                <InputLabel
                  htmlFor="guardian_phone"
                  value="WhatsApp de Cobro"
                  className="ml-2 text-primary"
                />
                <ChilePhoneInput
                  initialValue={data?.guardian_phone ?? ""}
                  value={data?.guardian_phone ?? ""}
                  onChange={(guardian_phone) =>
                    setData("guardian_phone", guardian_phone)
                  }
                  required={!data?.require_tutor}
                />
                <InputError message={errors?.guardian_phone} className="mt-2" />
              </div>
              <div>
                <InputLabel
                  htmlFor="guardian_relationship"
                  value="Parentesco (Padre, Hijo, etc.)"
                  className="ml-2 text-primary"
                />
                <select
                  id="guardian_relationship"
                  name="guardian_relationship"
                  value={data.guardian_relationship ?? ""}
                  onChange={(e) => {
                    setData("guardian_relationship", e.target.value);
                  }}
                  className="rounded-md w-full border-gray-100 shadow-sm focus:border-primary/20 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-primary dark:focus:ring-primary/20 border-[0.5px]"
                  required={!data?.require_tutor}
                >
                  {!data.guardian_relationship && (
                    <option value="">-- Estado --</option>
                  )}
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <InputError message={errors.status} className="mt-2" />
              </div>
            </div>
            <p className="text-xs italic text-gray-500">
              * Las notificaciones de pago y sesiones se enviarán a este
              contacto.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 mt-6 border-t">
        <h3 className="mb-4 font-semibold text-gray-800 text-md">
          Preferencias de Notificación
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Switch Maestro */}
          <label className="flex items-center p-3 space-x-3 border rounded-md bg-gray-50">
            <input
              type="checkbox"
              checked={data.opt_out_reminders}
              onChange={(e) => setData("opt_out_reminders", e.target.checked)}
              className="text-indigo-600 rounded"
            />
            <span className="text-sm font-medium">
              Recibir recordatorios de pago y sesiones
            </span>
          </label>

          {/* Canales Individuales (Solo si el maestro está activo) */}
          {data.opt_out_reminders && (
            <div className="flex items-center space-x-4">
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={data.prefers_whatsapp}
                  onChange={(e) =>
                    setData("prefers_whatsapp", e.target.checked)
                  }
                  className="mr-1"
                />{" "}
                WhatsApp
              </label>
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={data.prefers_mail}
                  onChange={(e) => setData("prefers_mail", e.target.checked)}
                  className="mr-1"
                />{" "}
                Email
              </label>
            </div>
          )}
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
          {data.id || isExistingInSystem
            ? "Actualizar y Vincular"
            : "Crear Paciente"}
        </PrimaryButton>
      </div>
    </form>
  );
}
