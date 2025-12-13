import React, { useState } from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import { fmtCLP } from "@/utils/utils";

export default function PortalPagoDeudas() {
  const { patient, deudas } = usePage().props;

  const [selectedItems, setSelectedItems] = useState(
    deudas?.map((d) => d.id) || []
  );

  const { post, processing, errors } = useForm();

  // Toggle selección de item
  const toggleItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Seleccionar/deseleccionar todos
  const toggleAll = () => {
    if (selectedItems.length === deudas.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(deudas.map((d) => d.id));
    }
  };

  // Calcular total seleccionado
  const totalSeleccionado = deudas
    .filter((d) => selectedItems.includes(d.id))
    .reduce((sum, d) => sum + d.amount_clp, 0);

  // Items para enviar al pago
  const itemsParaPago = deudas
    .filter((d) => selectedItems.includes(d.id))
    .map((d) => ({ id: d.id, type: d.type, amount_clp: d.amount_clp }));

  // Iniciar pago
  const iniciarPago = (e) => {
    e.preventDefault();
    if (itemsParaPago.length === 0) return;

    post("/pagar/iniciar", {
      data: { items: itemsParaPago },
    });
  };

  // Si no hay deudas, mostrar mensaje de éxito
  if (!deudas || deudas.length === 0) {
    return (
      <>
        <Head title="Sin pagos pendientes - KineMobile" />

        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
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
            <div className="pt-12">
              <div className="p-12 text-center bg-white shadow-lg rounded-2xl">
                <div className="mb-6">
                  <svg
                    className="w-20 h-20 mx-auto text-green-500"
                    fill="none"
                    viewBox="0 0 80 80"
                  >
                    <circle
                      cx="40"
                      cy="40"
                      r="38"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      d="M24 40L35 51L56 30"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h1 className="mb-3 text-2xl font-semibold text-green-500">
                  ¡Todo al día!
                </h1>
                <p className="mb-8 text-lg text-gray-600">
                  Hola {patient?.first_name}, no tienes pagos pendientes.
                </p>
                <Link
                  href="/pagar"
                  className="inline-block px-8 py-3 text-blue-600 transition-colors bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Consultar otro RUT
                </Link>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Head title="Pagos pendientes - KineMobile" />

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
          <div className="pt-4">
            {/* Header con nombre */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                Hola, {patient?.first_name}
              </h1>
              <p className="text-gray-500">
                Tienes {deudas.length} pago{deudas.length > 1 ? "s" : ""}{" "}
                pendiente
                {deudas.length > 1 ? "s" : ""}
              </p>
            </div>

            {/* Card de deudas */}
            <div className="overflow-hidden bg-white shadow-lg rounded-2xl">
              {/* Seleccionar todos */}
              {deudas.length > 1 && (
                <div className="px-5 py-4 border-b border-gray-100">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === deudas.length}
                      onChange={toggleAll}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-600">
                      {selectedItems.length === deudas.length
                        ? "Deseleccionar todos"
                        : "Seleccionar todos"}
                    </span>
                  </label>
                </div>
              )}

              {/* Lista de deudas */}
              <div className="overflow-y-auto divide-y divide-gray-100 max-h-80">
                {deudas.map((deuda) => (
                  <div
                    key={`${deuda.type}-${deuda.id}`}
                    onClick={() => toggleItem(deuda.id)}
                    className={`flex items-center px-5 py-4 cursor-pointer transition-colors
                                            ${
                                              selectedItems.includes(deuda.id)
                                                ? "bg-blue-50/50"
                                                : "hover:bg-gray-50"
                                            }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(deuda.id)}
                      onChange={() => toggleItem(deuda.id)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0 ml-3">
                      <span className="block font-medium text-gray-800 truncate">
                        {deuda.description}
                      </span>
                      <span className="block text-sm text-gray-400">
                        {deuda.date}
                      </span>
                    </div>
                    <span className="ml-4 font-semibold text-gray-800 whitespace-nowrap">
                      {fmtCLP(deuda.amount_clp)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Sección de pago */}
              <form
                onSubmit={iniciarPago}
                className="px-5 py-6 border-t border-gray-200 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-gray-600">Total a pagar:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {fmtCLP(totalSeleccionado)}
                  </span>
                </div>

                {/* Errores */}
                {(errors.items || errors.webpay || errors.rut) && (
                  <div className="p-3 mb-4 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                    {errors.items || errors.webpay || errors.rut}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={processing || selectedItems.length === 0}
                  className="flex items-center justify-center w-full gap-3 py-4 text-lg font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-green-500/25"
                >
                  {processing ? (
                    <>
                      <span className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin"></span>
                      Conectando con Webpay...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="1"
                          y="4"
                          width="22"
                          height="16"
                          rx="2"
                          ry="2"
                        />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      Pagar con Webpay
                    </>
                  )}
                </button>

                <div className="mt-4 text-sm text-center text-gray-400">
                  🔒 Pago seguro
                </div>
              </form>
            </div>

            {/* Link para consultar otro RUT */}
            <Link
              href="/pagar"
              className="block w-full py-4 mt-5 text-center text-gray-500 transition-colors hover:text-blue-600"
            >
              ¿No eres {patient?.first_name}? Consultar otro RUT
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
