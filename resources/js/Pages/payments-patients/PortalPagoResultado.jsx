import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { fmtCLP } from "@/utils/utils";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PortalPagoResultado() {
  const { success, message, transaction, cancelled, rejected } =
    usePage().props;
  return (
    <>
      <Head title={success ? "Pago Exitoso" : "Pago No Completado"} />

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

        <main className="max-w-lg px-4 py-12 mx-auto">
          <div
            className={`bg-white rounded-2xl p-8 shadow-lg text-center border-t-4
                        ${success ? "border-green-500" : "border-red-500"}`}
          >
            {/* Icono */}
            <div className="mb-6">
              {success ? (
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
              ) : cancelled ? (
                <svg
                  className="w-20 h-20 mx-auto text-gray-500"
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
                    d="M28 28L52 52M52 28L28 52"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  className="w-20 h-20 mx-auto text-red-500"
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
                    d="M40 24V44M40 52V56"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>

            {/* Título */}
            <h1
              className={`text-2xl font-semibold mb-3
                            ${
                              success
                                ? "text-green-500"
                                : cancelled
                                ? "text-gray-500"
                                : "text-red-500"
                            }`}
            >
              {success
                ? "¡Pago exitoso!"
                : cancelled
                ? "Pago cancelado"
                : "Pago no procesado"}
            </h1>

            {/* Mensaje */}
            <p className="mb-8 leading-relaxed text-gray-600">{message}</p>

            {/* Detalles de transacción (solo si éxito) */}
            {success && transaction && (
              <div className="p-5 mb-8 text-left bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Monto pagado</span>
                  <span className="text-xl font-bold text-green-500">
                    {fmtCLP(transaction.amount_clp)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Código autorización</span>
                  <span className="font-medium text-gray-800">
                    {transaction.authorization_code}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Orden de compra</span>
                  <span className="font-medium text-gray-800">
                    {transaction.buy_order}
                  </span>
                </div>
                {transaction.card_number && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-500">Tarjeta</span>
                    <span className="font-medium text-gray-800">
                      **** {transaction.card_number}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-500">Fecha</span>
                  <span className="font-medium text-gray-800">
                    {formatDate(transaction.transaction_date)}
                  </span>
                </div>
              </div>
            )}

            {/* Botón de acción */}
            <div className="mb-6">
              <Link
                href="/pagar"
                className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white transition-colors bg-blue-600 rounded-xl hover:bg-blue-700"
              >
                {success ? "Volver al inicio" : "Intentar nuevamente"}
              </Link>
            </div>

            {/* Notas adicionales */}
            {success && (
              <p className="text-sm text-gray-400">
                Se ha enviado un comprobante a tu correo electrónico.
              </p>
            )}

            {rejected && (
              <p className="text-sm text-gray-400">
                Si el problema persiste, contacta a tu banco o intenta con otra
                tarjeta.
              </p>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
