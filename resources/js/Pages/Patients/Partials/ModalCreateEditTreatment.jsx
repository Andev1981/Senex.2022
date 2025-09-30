import { useForm } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import Switch from "@/Components/Switch";
import StatusSelect from "@/Components/StatusSelect";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { useEffect, useState } from "react";
import Autocomplete from "@/Components/Autocomplete";
import { Textarea } from "@headlessui/react";
import moment from "moment/moment";

export default function ModalCreateEditTreatment({
  treatment,
  session_types,
  patient,
  doctors,
  setOpenModalTreatment,
}) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    id: treatment?.id || null,
    patient_id: patient?.id,
    doctor_id: treatment?.doctor_id || "",
    session_type_id: treatment?.session_type_id || "",
    diagnosis: treatment?.diagnosis || "",
    planned_sessions: treatment?.planned_sessions || 0,
    is_indefinite: treatment?.is_indefinite || false,
    evaluation_required: treatment?.evaluation_required || false,
    status: treatment?.status || "active",
    start_date: treatment?.start_date
      ? moment.utc(treatment?.start_date).format("YYYY-MM-DD")
      : moment.utc(Date.now()).format("YYYY-MM-DD"),
    end_date: treatment?.end_date
      ? moment.utc(treatment?.end_date).format("YYYY-MM-DD")
      : "",
    notes: treatment?.notes || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const opts = {
      preserveState: (page) => Object.keys(page.props.errors || {}).length > 0,
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setOpenModalTreatment(false);
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
      post(route("treatments.update", data.id), opts); // si tu ruta acepta POST con _method
    } else {
      post(route("treatments.store"), opts);
    }
  };

  const [queryDoctor, setQueryDoctor] = useState("");
  const [resultsDoctor, setResultsDoctor] = useState([]);
  const [showDropdownDoctor, setShowDropdownDoctor] = useState(false);

  const [querySessionType, setQuerySessionType] = useState("");
  const [resultsSessionType, setResultsSessionType] = useState([]);
  const [showDropdownSessionType, setShowDropdownSessionType] = useState(false);

  useEffect(() => {
    queryDoctorFunction(queryDoctor);
    querySessionTypeFunction(querySessionType);
  }, [queryDoctor, querySessionType, doctors, session_types]);

  const queryDoctorFunction = (q) => {
    if (q.length < 2) {
      setResultsDoctor([]);
      setShowDropdownDoctor(false);
      return;
    }
  };

  const querySessionTypeFunction = (q) => {
    if (q.length < 2) {
      setResultsSessionType([]);
      setShowDropdownSessionType(false);
      return;
    }
  };

  const handleSelect = (item) => {
    setQueryDoctor(item);
    setShowDropdownDoctor(false);
    if (onSelect) onSelect(item);
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
        <div>
          <InputLabel
            htmlFor="doctor"
            value="Doctor/Kinesiólogo"
            className="ml-2 text-primary"
          />
          <Autocomplete
            data={doctors}
            getLabel={(k) => `${k?.name ?? ""} ${k?.last_name ?? ""}`.trim()}
            getKey={(k) => k.id} // usa el id único
            onSelect={(k) => {
              setData("doctor_id", k.id);
            }}
            placeholder="Buscar kinesiólogo/a…"
          />
        </div>
        <div>
          <InputLabel
            htmlFor="session_types"
            value="Tipo de Sesión"
            className="ml-2 text-primary"
          />
          <Autocomplete
            data={session_types}
            getLabel={(k) => `${k?.name ?? ""}`.trim()}
            getKey={(k) => k.id} // usa el id único
            onSelect={(k) => {
              setData("session_type_id", k.id);
            }}
            placeholder="Buscar tipo de sesión…"
          />
        </div>
        <div>
          <InputLabel
            htmlFor="fecha inicio"
            value="Fecha Inicio"
            className="ml-2 text-primary"
          />
          <TextInput
            type="date"
            id="start_date"
            name="start_date"
            value={data?.start_date}
            onChange={(e) => setData("start_date", e.target.value)}
            required
            className="w-full"
          />
          <InputError message={errors?.start_date} className="mt-2" />
        </div>
        <div>
          <InputLabel
            htmlFor="fecha termino"
            value="Fecha Término"
            className="ml-2 text-primary"
          />
          <TextInput
            type="date"
            id="end_date"
            name="end_date"
            value={data?.end_date}
            onChange={(e) => setData("end_date", e.target.value)}
            className="w-full"
          />
          <InputError message={errors?.end_date} className="mt-2" />
        </div>
        <div>
          <InputLabel
            htmlFor="status"
            value="Estado"
            className="ml-2 text-primary"
          />
          <StatusSelect
            value={data.status}
            onChange={(v) => setData("status", v)}
            placeholder="Selecciona estado…"
          />
          <InputError message={errors?.is_active} className="mt-2" />
        </div>

        <div>
          <div className="flex items-center gap-3">
            <InputLabel
              htmlFor="is_indefinite"
              value={
                data?.is_indefinite
                  ? "Cantidad Indefinida"
                  : "Cantidad Definida"
              }
            />

            <Switch
              id="is_indefinite"
              name="is_indefinite"
              checked={!!data?.is_indefinite}
              onChange={(e) => {
                const checked = e?.target?.checked ?? false;
                setData("is_indefinite", checked);
                if (checked) {
                  setData("planned_sessions", "");
                }
              }}
              label="Indefinido"
            />
          </div>

          <TextInput
            type="number"
            id="planned_sessions"
            name="planned_sessions"
            value={data?.planned_sessions ?? ""}
            onChange={(e) => setData("planned_sessions", e.target.value)}
            required={!data?.is_indefinite}
            disabled={!!data?.is_indefinite}
            placeholder={data?.is_indefinite ? "Indefinida" : "0"}
            min={1}
            step={1}
            className="w-full"
            inputMode="numeric"
          />

          <InputError message={errors?.planned_sessions} className="mt-2" />
        </div>

        <div>
          <InputLabel
            htmlFor="base_price"
            value={
              data?.evaluation_required
                ? "Requiere evaluación"
                : "No requiere evaluación"
            }
          />

          <Switch
            label="Indefinido"
            name="evaluation_required"
            checked={data.evaluation_required}
            onChange={(e) => {
              setData("evaluation_required", e.target.checked);
            }}
          />
          <InputError message={errors?.evaluation_required} className="mt-2" />
        </div>
      </div>
      <hr className="my-4" />
      <div className="grid grid-cols-1 gap-4 px-4 pt-2">
        <div>
          <InputLabel htmlFor="diagnosis" value="Diagnóstico" />
          <Textarea
            id="diagnosis"
            name="diagnosis"
            value={data?.diagnosis || ""}
            onChange={(e) => setData("diagnosis", e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            rows={2}
          />

          <InputError message={errors?.diagnosis} className="mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 px-4 pt-2">
        <div>
          <InputLabel htmlFor="notes" value="Notas" />
          <Textarea
            id="notes"
            name="notes"
            value={data?.notes || ""}
            onChange={(e) => setData("notes", e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            rows={2}
          />

          <InputError message={errors?.notes} className="mt-2" />
        </div>
      </div>
      <hr className="my-4" />

      <div className="flex justify-end gap-3 px-4 my-4">
        <SecondaryButton
          type="button"
          variant="outline"
          onClick={() => (reset(), setOpenModalTreatment(false))}
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
