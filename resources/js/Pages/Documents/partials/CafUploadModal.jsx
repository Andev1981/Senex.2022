import React from 'react';
import { useForm } from "@inertiajs/react";
import { UploadCloud, FileText, X, AlertCircle } from "lucide-react";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";

export default function CafUploadModal({ isOpen, onClose, company }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    archivo_caf: null,
  });

  const submit = (e) => {
    e.preventDefault();
    if (!data.archivo_caf) return;

    post(route("companies.caf.store", company.id), {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Cargar Autorización de Folios (CAF)" maxWidth="lg">
      <form onSubmit={submit} className="p-6">
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-bold mb-1">¿Qué es el archivo CAF?</p>
              <p className="opacity-80">Es el archivo XML que autoriza el uso de un rango de folios para sus documentos electrónicos. Debe obtenerlo desde el portal del SII.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="enterprise-label ml-1">Archivo XML (CAF)</label>
            <div 
              className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-3 ${
                data.archivo_caf ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200 hover:border-brand-primary/50 bg-gray-50/50'
              }`}
            >
              <input
                type="file"
                accept=".xml"
                onChange={(e) => setData("archivo_caf", e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {data.archivo_caf ? (
                <>
                  <FileText className="w-10 h-10 text-brand-primary" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">{data.archivo_caf.name}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{(data.archivo_caf.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setData("archivo_caf", null)}
                    className="mt-2 text-[10px] font-black uppercase text-red-500 hover:underline"
                  >
                    Quitar archivo
                  </button>
                </>
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 text-gray-300" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-600">Arrastra el archivo o haz clic aquí</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Solo archivos .xml autorizados</p>
                  </div>
                </>
              )}
            </div>
            {errors.archivo_caf && (
              <p className="text-xs text-red-500 font-bold mt-2 ml-1 flex items-center gap-1">
                <X className="w-3 h-3" /> {errors.archivo_caf}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <SecondaryButton onClick={onClose} type="button" className="!rounded-xl">
            Cancelar
          </SecondaryButton>
          <PrimaryButton 
            disabled={processing || !data.archivo_caf} 
            className={`!rounded-xl !px-8 ${processing ? 'opacity-50' : ''}`}
          >
            {processing ? 'Procesando...' : 'Cargar y Activar Folios'}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
