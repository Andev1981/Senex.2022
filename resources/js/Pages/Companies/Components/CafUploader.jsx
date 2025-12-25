import { useForm } from "@inertiajs/react";

export default function CafUploader({ company }) {
  const { data, setData, post, processing, errors } = useForm({
    archivo_caf: null,
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("companies.caf.store", company.id), {
      onSuccess: () => setData("archivo_caf", null), // Limpiar input
    });
  };

  return (
    <form onSubmit={submit} className="flex gap-2 items-end">
      <div>
        <label className="block text-sm font-bold">
          Cargar Nuevo CAF (XML)
        </label>
        <input
          type="file"
          accept=".xml"
          onChange={(e) => setData("archivo_caf", e.target.files[0])}
          className="border p-1 rounded"
        />
        {errors.archivo_caf && (
          <div className="text-red-500 text-xs">{errors.archivo_caf}</div>
        )}
      </div>
      <button
        disabled={processing}
        className="bg-green-600 text-white px-4 py-2 rounded h-fit"
      >
        Subir y Procesar
      </button>
    </form>
  );
}
