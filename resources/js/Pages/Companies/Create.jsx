import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Building2, Save, ArrowLeft, Image as ImageIcon } from "lucide-react";
import axios from "axios";

export default function Create() {
  // 1. Hook de formulario Inertia
  const { data, setData, post, processing, errors } = useForm({
    rut: "",
    business_name: "",
    giro: "",
    email: "",
    phone: "",
    logo: null,
  });

  // Estado local para loading de búsqueda externa
  const [isSearching, setIsSearching] = useState(false);

  const handleRutBlur = async () => {
    if (!data.rut || data.rut.length < 8) return;

    setIsSearching(true);
    try {
      const response = await axios.get(route("external-data.company", { rut: data.rut }));
      if (response.data.success) {
        const { razon_social, giro } = response.data.data;
        
        // Actualizamos múltiples campos a la vez
        setData((prevData) => ({
          ...prevData,
          business_name: razon_social || prevData.business_name,
          giro: giro || prevData.giro,
        }));
      }
    } catch (error) {
      console.warn("No se pudo obtener la información de la empresa automáticamente.");
    } finally {
      setIsSearching(false);
    }
  };

  // Estado local solo para la previsualización de la imagen
  const [preview, setPreview] = useState(null);

  // 2. Manejo de cambio de imagen con preview
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData("logo", file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // 3. Envío del formulario
  const submit = (e) => {
    e.preventDefault();
    // Inertia detecta el archivo y configura automáticamente multipart/form-data
    post(route("companies.store"));
  };

  return (
    <AuthenticatedLayout>
      <Head title="Nueva Empresa" />

      <div className="min-h-screen p-6 bg-gray-50/50 space-y-8">
        {/* Header Hero */}
        <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 shadow-xl shadow-brand-primary/20 bg-brand-primary rounded-2xl transform rotate-3">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">Registro de Entidad</h1>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
                  Alta de Nueva Empresa o Holding • Senex Enterprise
                </p>
              </div>
            </div>
            <Link
              href={route("companies.index")}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-gray hover:text-brand-primary transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al listado
            </Link>
          </div>
        </div>

        {/* Formulario */}
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-white shadow-xl rounded-[2.5rem] border border-gray-100 overflow-hidden">
            <form onSubmit={submit} className="p-10 space-y-8">
              {/* Sección 1: Datos Principales */}
              <div className="space-y-6">
                <h3 className="enterprise-label !text-brand-primary border-b border-gray-50 pb-2">Identificación Legal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* RUT */}
                    <div className="space-y-1">
                    <label className="enterprise-label ml-1">
                        RUT Empresa <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Ej: 76.123.456-K"
                        className={`w-full rounded-2xl border-gray-100 py-4 px-5 font-bold text-gray-700 focus:ring-brand-primary transition-all bg-gray-50/50 focus:bg-white ${
                        errors.rut ? "border-red-500" : ""
                        } ${isSearching ? "animate-pulse opacity-70" : ""}`}
                        value={data.rut}
                        onChange={(e) => setData("rut", e.target.value)}
                        onBlur={handleRutBlur}
                    />
                    {errors.rut && (
                        <p className="mt-1 text-xs text-red-500 font-bold">{errors.rut}</p>
                    )}
                    </div>

                    {/* Razón Social */}
                    <div className="space-y-1">
                    <label className="enterprise-label ml-1">
                        Razón Social <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Nombre legal completo"
                        className={`w-full rounded-2xl border-gray-100 py-4 px-5 font-bold text-gray-700 focus:ring-brand-primary transition-all bg-gray-50/50 focus:bg-white ${
                        errors.business_name ? "border-red-500" : ""
                        }`}
                        value={data.business_name}
                        onChange={(e) => setData("business_name", e.target.value)}
                    />
                    {errors.business_name && (
                        <p className="mt-1 text-xs text-red-500 font-bold">{errors.business_name}</p>
                    )}
                    </div>

                    {/* Giro */}
                    <div className="md:col-span-2 space-y-1">
                    <label className="enterprise-label ml-1">
                        Giro Comercial
                    </label>
                    <input
                        type="text"
                        placeholder="Ej: Prestación de Servicios de Salud"
                        className="w-full rounded-2xl border-gray-100 py-4 px-5 font-bold text-gray-700 focus:ring-brand-primary transition-all bg-gray-50/50 focus:bg-white"
                        value={data.giro}
                        onChange={(e) => setData("giro", e.target.value)}
                    />
                    </div>
                </div>
              </div>

              {/* Sección 2: Contacto y Marca */}
              <div className="space-y-6">
                <h3 className="enterprise-label !text-brand-primary border-b border-gray-50 pb-2">Contacto & Branding</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Email */}
                    <div className="space-y-1">
                    <label className="enterprise-label ml-1">
                        Correo Corporativo
                    </label>
                    <input
                        type="email"
                        placeholder="admin@clinica.cl"
                        className="w-full rounded-2xl border-gray-100 py-4 px-5 font-bold text-gray-700 focus:ring-brand-primary transition-all bg-gray-50/50 focus:bg-white"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                    />
                    </div>

                    {/* Teléfono */}
                    <div className="space-y-1">
                    <label className="enterprise-label ml-1">
                        Teléfono de Contacto
                    </label>
                    <input
                        type="text"
                        placeholder="+56 9 ..."
                        className="w-full rounded-2xl border-gray-100 py-4 px-5 font-bold text-gray-700 focus:ring-brand-primary transition-all bg-gray-50/50 focus:bg-white"
                        value={data.phone}
                        onChange={(e) => setData("phone", e.target.value)}
                    />
                    </div>

                    {/* Logo Upload con Preview */}
                    <div className="md:col-span-2">
                    <label className="enterprise-label ml-1 mb-4">
                        Imagen de Marca (Logo)
                    </label>
                    <div className="flex items-center gap-8 p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100">
                        {/* Preview Circle */}
                        <div className="shrink-0">
                        <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-white overflow-hidden shadow-inner transform -rotate-3">
                            {preview ? (
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                            ) : (
                            <ImageIcon className="w-10 h-10 text-gray-200" />
                            )}
                        </div>
                        </div>

                        {/* Input File */}
                        <div className="flex-1">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="block w-full text-[10px] font-black uppercase tracking-widest text-gray-400 file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-brand-primary file:text-white hover:file:brightness-110 transition-all cursor-pointer"
                        />
                        <p className="mt-2 text-[10px] font-bold text-brand-gray uppercase tracking-widest opacity-60">
                            Recomendado: PNG Transparente • Máximo 2MB
                        </p>
                        {errors.logo && (
                            <p className="mt-1 text-xs text-red-500 font-black">
                            {errors.logo}
                            </p>
                        )}
                        </div>
                    </div>
                    </div>
                </div>
              </div>

              {/* Footer con acciones */}
              <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-50">
                <Link
                  href={route("companies.index")}
                  className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brand-gray hover:bg-gray-50 rounded-2xl transition-all"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex items-center gap-3 px-10 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20 hover:brightness-110 disabled:opacity-50 transition-all active:scale-95"
                >
                  {processing ? (
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Finalizar Registro
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
