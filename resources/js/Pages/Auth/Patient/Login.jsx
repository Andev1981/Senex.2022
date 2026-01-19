import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { UserCircle, ArrowRight, Loader2 } from "lucide-react";
import InputError from "@/components/InputError";
import RutInput from "@/components/RutInput";

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

      <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-blue-50 via-white to-indigo-50 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full shadow-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <UserCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Portal de Pacientes
            </h1>
            <p className="text-gray-600">Ingresa con tu RUT para acceder</p>
          </div>

          {/* Card Principal */}
          <div className="overflow-hidden bg-white shadow-xl rounded-2xl">
            <div className="px-8 py-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Input RUT */}
                <div>
                  <label
                    htmlFor="rut"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    RUT
                  </label>
                  <RutInput
                    initialValue={data?.rut}
                    value={data?.rut}
                    onChange={(rut) => setData("rut", rut)}
                    setRutError={(error) => (errors.rut = error)}
                  />
                  <InputError message={errors?.rut} className="mt-2" />
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
              <div className="pt-6 mt-6 border-t border-gray-200">
                <div className="p-4 rounded-lg bg-blue-50">
                  <p className="mb-2 text-sm text-gray-700">
                    <strong className="text-blue-900">¿Cómo funciona?</strong>
                  </p>
                  <ol className="space-y-1 text-sm text-gray-600 list-decimal list-inside">
                    <li>Ingresa tu RUT</li>
                    <li>Recibirás un código por email</li>
                    <li>Ingresa el código para acceder</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-center text-gray-600">
                ¿Problemas para acceder?{" "}
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Contacta al centro
                </a>
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="mt-6 text-xs text-center text-gray-500">
            Al continuar, aceptas nuestros términos de servicio y política de
            privacidad
          </p>
        </div>
      </div>
    </>
  );
}
