import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Building2, Save, ArrowLeft, Image as ImageIcon } from "lucide-react";

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

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          {/* Header con botón Volver */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Building2 className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Registrar Nueva Empresa
              </h2>
            </div>
            <Link
              href={route("companies.index")}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al listado
            </Link>
          </div>

          {/* Formulario */}
          <div className="bg-white shadow-sm sm:rounded-xl border border-gray-100 overflow-hidden">
            <form onSubmit={submit} className="p-6 md:p-8 space-y-6">
              {/* Sección 1: Datos Principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* RUT */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    RUT Empresa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 76123456-K"
                    className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                      errors.rut ? "border-red-500" : ""
                    }`}
                    value={data.rut}
                    onChange={(e) => setData("rut", e.target.value)}
                  />
                  {errors.rut && (
                    <p className="mt-1 text-xs text-red-500">{errors.rut}</p>
                  )}
                </div>

                {/* Razón Social */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Razón Social <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre legal o de fantasía"
                    className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                      errors.business_name ? "border-red-500" : ""
                    }`}
                    value={data.business_name}
                    onChange={(e) => setData("business_name", e.target.value)}
                  />
                  {errors.business_name && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.business_name}
                    </p>
                  )}
                </div>

                {/* Giro (Opcional pero recomendado para DTE) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Giro Comercial
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Servicios de Kinesiología y Salud"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={data.giro}
                    onChange={(e) => setData("giro", e.target.value)}
                  />
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Sección 2: Contacto y Marca */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={data.phone}
                    onChange={(e) => setData("phone", e.target.value)}
                  />
                </div>

                {/* Logo Upload con Preview */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Logo Corporativo
                  </label>
                  <div className="flex items-center gap-6">
                    {/* Preview Circle */}
                    <div className="shrink-0">
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                        {preview ? (
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                        )}
                      </div>
                    </div>

                    {/* Input File */}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG o GIF hasta 2MB.
                      </p>
                      {errors.logo && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.logo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer con acciones */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <Link
                  href={route("companies.index")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {processing ? (
                    "Guardando..."
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Empresa
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
