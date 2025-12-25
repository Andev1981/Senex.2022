import { useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import { useEffect } from "react";
import { fmtDateISO } from "@/utils/utils";

export default function AgreementFormModal({
  show,
  onClose,
  agreement,
  insurances,
}) {
  // ... (Lógica de useForm y handleSubmit, la cual se mantiene igual) ...
  const isEdit = !!agreement;
  // Inicializamos vacío (los datos reales entran por el useEffect)
  const { data, setData, post, put, processing, errors, reset, clearErrors } =
    useForm({
      insurance_id: "",
      name: "",
      version: "1.0",
      is_active: true,
      start_date: "",
    });

  // 2. LA MAGIA: Sincronizar Props con Inertia Form
  useEffect(() => {
    if (agreement) {
      // MODO EDICIÓN: Cargamos los datos que vienen del prop
      setData({
        insurance_id: agreement.insurance_id,
        name: agreement.name,
        version: agreement.version,
        is_active: Boolean(agreement.is_active),
        start_date: agreement.start_date,
      });
    } else {
      // MODO CREACIÓN: Si se abre y no hay convenio, limpiamos
      if (show) {
        reset();
        clearErrors();
      }
    }
  }, [agreement, show]); // Se ejecuta cada vez que cambia el convenio seleccionado

  const handleSubmit = (e) => {
    e.preventDefault();
    const routeName = isEdit ? "agreements.update" : "agreements.store";
    const routeParams = isEdit ? agreement.id : undefined;

    const method = isEdit ? put : post;

    /*  console.log(method, routeName, routeParams);

    return; */

    method(route(routeName, routeParams), {
      onSuccess: () => onClose(),
      onError: (err) => console.error(err),
      preserveScroll: true,
    });
  };

  return (
    <Modal
      open={show}
      onClose={() => onClose()}
      title="Nuevo convenio"
      description="Datos del nuevo convenio"
      width="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Aseguradora (Vínculo)
          </span>
          <select
            value={data.insurance_id}
            onChange={(e) => setData("insurance_id", parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            disabled={isEdit}
            required
          >
            <option value="">Seleccione Aseguradora</option>
            {insurances?.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          {errors.insurance_id && (
            <div className="text-red-500 text-xs mt-1">
              {errors.insurance_id}
            </div>
          )}
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Nombre del Contrato
            </span>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
            {errors.name && (
              <div className="text-red-500 text-xs mt-1">{errors.name}</div>
            )}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Versión</span>
            <input
              type="text"
              value={data.version}
              onChange={(e) => setData("version", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.version && (
              <div className="text-red-500 text-xs mt-1">{errors.version}</div>
            )}
          </label>
        </div>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={data.is_active}
            onChange={(e) => setData("is_active", e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 shadow-sm"
          />
          <span className="text-sm text-gray-700">Convenio Activo</span>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Fecha de Inicio (Vigencia)
          </span>
          <input
            type="date"
            value={fmtDateISO(data.start_date)}
            onChange={(e) => setData("start_date", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required // CRÍTICO: Debe ser requerida
          />
          {errors.start_date && (
            <div className="text-red-500 text-xs mt-1">{errors.start_date}</div>
          )}
        </label>

        <button
          type="submit"
          disabled={processing}
          className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-150"
        >
          {processing
            ? "Guardando..."
            : isEdit
            ? "Actualizar Convenio"
            : "Crear Convenio"}
        </button>
      </form>
    </Modal>
  );
}
