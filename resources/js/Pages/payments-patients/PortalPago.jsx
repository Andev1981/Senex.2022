import React from "react";
import { Head, useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import RutInput from "@/Components/RutInput";

export default function PortalPago() {
  const { data, setData, post, processing, errors } = useForm({
    rut: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post("/pagar");
  };

  return (
    <>
      <Head title="Pagar - KineMobile" />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-lg px-4 py-4 mx-auto">
            <div className="flex items-center gap-3 text-blue-600">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M14 20C14 16.6863 16.6863 14 20 14C23.3137 14 26 16.6863 26 20C26 23.3137 23.3137 26 20 26"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="20" cy="20" r="3" fill="currentColor" />
              </svg>
              <span className="text-xl font-semibold">KineMobile</span>
            </div>
          </div>
        </header>

        <main className="max-w-lg px-4 py-8 mx-auto">
          <div className="flex flex-col items-center pt-8">
            <div className="w-full p-8 text-center bg-white shadow-lg rounded-2xl">
              <h1 className="mb-2 text-2xl font-semibold text-gray-900">
                Consulta y paga tus sesiones
              </h1>
              <p className="mb-8 text-gray-500">
                Ingresa tu RUT para ver tus pagos pendientes
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-6 text-left">
                  <label
                    htmlFor="rut"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    RUT
                  </label>
                  <RutInput
                    value={data.rut}
                    onChange={(rut) => setData("rut", rut)}
                    disabled={processing}
                    className={errors.rut ? "border-red-500" : ""}
                  />
                  <InputError message={errors.rut} className="mt-2" />
                </div>

                <button
                  type="submit"
                  disabled={processing || data.rut.length < 3}
                  className="flex items-center justify-center w-full gap-2 py-4 text-lg font-semibold text-white transition-all bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <span className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin"></span>
                      Consultando...
                    </>
                  ) : (
                    "Consultar"
                  )}
                </button>
              </form>
            </div>

            <p className="mt-8 text-sm text-gray-400">
              Sistema seguro de pagos
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
