import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { UserCircle, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    rut: "",
  });

  const [formattedRut, setFormattedRut] = useState("");

  /**
   * Formatear RUT mientras el usuario escribe
   * Formato: 12.345.678-9
   */
  const handleRutChange = (e) => {
    let value = e.target.value.replace(/[^0-9kK]/g, ""); // Solo números y K

    if (value.length === 0) {
      setFormattedRut("");
      setData("rut", "");
      return;
    }

    // Separar dígito verificador
    let rut = value.slice(0, -1);
    let dv = value.slice(-1).toUpperCase();

    // Formatear con puntos
    let formatted = "";
    let counter = 0;
    for (let i = rut.length - 1; i >= 0; i--) {
      if (counter === 3) {
        formatted = "." + formatted;
        counter = 0;
      }
      formatted = rut[i] + formatted;
      counter++;
    }

    // Agregar guión y dígito verificador si existe
    if (dv) {
      formatted += "-" + dv;
    }

    setFormattedRut(formatted);
    setData("rut", value); // Guardar sin formato para el backend
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("patient.request-code"));
  };

  return (
    <>
      <Head title="Acceso Pacientes" />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-lg mb-4">
              <UserCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Portal de Pacientes
            </h1>
            <p className="text-gray-600">Ingresa con tu RUT para acceder</p>
          </div>

          {/* Card Principal */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-8 py-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Input RUT */}
                <div>
                  <label
                    htmlFor="rut"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    RUT
                  </label>
                  <div className="relative">
                    <input
                      id="rut"
                      type="text"
                      value={formattedRut}
                      onChange={handleRutChange}
                      placeholder="12.345.678-9"
                      maxLength="12"
                      className={`
                        w-full px-4 py-3 text-lg border-2 rounded-xl
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-all duration-200
                        ${
                          errors.rut
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }
                      `}
                      disabled={processing}
                      autoFocus
                    />
                    {formattedRut && !errors.rut && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>

                  {errors.rut && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="font-medium">⚠️</span>
                      {errors.rut}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-gray-500">
                    Ingresa tu RUT sin puntos ni guión. Ejemplo: 123456789
                  </p>
                </div>

                {/* Botón Submit */}
                <button
                  type="submit"
                  disabled={processing || !data.rut}
                  className={`
                    w-full py-4 px-6 rounded-xl font-semibold text-lg
                    transition-all duration-200 flex items-center justify-center gap-3
                    ${
                      processing || !data.rut
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                    }
                  `}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      Continuar
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Info adicional */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong className="text-blue-900">¿Cómo funciona?</strong>
                  </p>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Ingresa tu RUT</li>
                    <li>Recibirás un código por email</li>
                    <li>Ingresa el código para acceder</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                ¿Problemas para acceder?{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Contacta al centro
                </a>
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="mt-6 text-center text-xs text-gray-500">
            Al continuar, aceptas nuestros términos de servicio y política de
            privacidad
          </p>
        </div>
      </div>
    </>
  );
}
