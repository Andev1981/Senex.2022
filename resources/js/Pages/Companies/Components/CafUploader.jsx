import { useForm } from "@inertiajs/react";
import { UploadCloud, FileJson, CheckCircle2, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

export default function CafUploader({ company }) {
  const { data, setData, post, processing, errors } = useForm({
    archivo_caf: null,
  });

  const submit = (e) => {
    e.preventDefault();
    if (!data.archivo_caf) return;
    
    post(route("companies.folios.store", company.id), {
      onSuccess: () => {
        Swal.fire({
          title: '¡Folios Cargados!',
          text: 'El archivo CAF ha sido procesado y los folios están disponibles para su uso.',
          icon: 'success',
          confirmButtonColor: '#000',
          confirmButtonText: 'Genial'
        });
        setData("archivo_caf", null);
      },
      onError: (err) => {
        Swal.fire({
          title: 'Error en CAF',
          text: err.archivo_caf || 'No se pudo procesar el archivo XML. Verifique que corresponda al RUT de la empresa.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50/50 p-4 rounded-3xl border border-gray-100 shadow-inner">
      <div className="flex-1 w-full space-y-1">
        <div className="flex items-center gap-2 mb-1 ml-1">
            <FileJson className="w-3 h-3 text-brand-primary" />
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Archivo CAF (.xml)
            </label>
        </div>
        <input
          type="file"
          accept=".xml"
          onChange={(e) => setData("archivo_caf", e.target.files[0])}
          className="block w-full text-[10px] font-black uppercase tracking-widest text-gray-400 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-gray-900 file:text-white hover:file:bg-black transition-all cursor-pointer bg-white rounded-xl border border-gray-100 p-1"
        />
      </div>
      
      <button
        disabled={processing || !data.archivo_caf}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:brightness-110 transition shadow-lg shadow-brand-primary/20 disabled:opacity-30 disabled:cursor-not-allowed group"
      >
        <UploadCloud className={`w-4 h-4 transition-transform ${processing ? 'animate-bounce' : 'group-hover:-translate-y-1'}`} />
        {processing ? "Cargando..." : "Autorizar Folios"}
      </button>
    </form>
  );
}
