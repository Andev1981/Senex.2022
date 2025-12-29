import { useForm } from "@inertiajs/react";
import { UploadCloud } from "lucide-react";

export default function CafUploader({ company }) {
  const { data, setData, post, processing, errors } = useForm({
    archivo_caf: null,
  });

  const submit = (e) => {
    e.preventDefault();
    if (!data.archivo_caf) return;
    
    post(route("companies.caf.store", company.id), {
      onSuccess: () => setData("archivo_caf", null), // Limpiar input
    });
  };

  return (
    <form onSubmit={submit} className="flex gap-3 items-end">
      <div className="space-y-1">
        <label className="enterprise-label ml-1">
          Nuevo Archivo CAF (XML)
        </label>
        <input
          type="file"
          accept=".xml"
          onChange={(e) => setData("archivo_caf", e.target.files[0])}
          className="block w-full text-[10px] font-black uppercase tracking-widest text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-gray-100 file:text-gray-600 hover:file:bg-gray-200 transition-all cursor-pointer border border-gray-50 rounded-xl"
        />
        {errors.archivo_caf && (
          <div className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors.archivo_caf}</div>
        )}
      </div>
      <button
        disabled={processing || !data.archivo_caf}
        className="flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:brightness-110 transition shadow-lg shadow-brand-primary/20 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <UploadCloud className="w-4 h-4" />
        {processing ? "Procesando..." : "Subir Folios"}
      </button>
    </form>
  );
}
