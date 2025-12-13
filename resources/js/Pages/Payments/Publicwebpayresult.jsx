import { Head } from "@inertiajs/react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useEffect } from "react";

/**
 * Componente de Resultado Público de Pagos Webpay (JSX)
 *
 * Versión React del resultado público para payment links o pagos sin autenticación.
 * Similar a public-result.blade.php pero en JSX.
 *
 * Ubicación sugerida: resources/js/Pages/Payments/PublicWebpayResult.jsx
 *
 * Props:
 * - success: boolean - Si el pago fue exitoso
 * - message: string - Mensaje principal
 * - payment: object - Datos del pago (opcional)
 */
export default function PublicWebpayResult({ success, message, payment }) {
  // Auto-cerrar después de 10 segundos si es exitoso
  useEffect(() => {
    if (success && window.opener) {
      const timer = setTimeout(() => {
        window.close();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [success]);

  // Configuración visual según el resultado
  const Icon = success ? CheckCircle : XCircle;
  const iconColor = success ? "text-green-500" : "text-red-500";
  const bgColor = success ? "bg-green-50" : "bg-red-50";
  const borderColor = success ? "border-green-200" : "border-red-200";
  const title = success ? "Pago Exitoso" : "Pago No Procesado";
  const alertBgColor = success ? "bg-blue-50" : "bg-yellow-50";
  const alertBorderColor = success ? "border-blue-200" : "border-yellow-200";
  const alertTextColor = success ? "text-blue-800" : "text-yellow-800";

  // Formatear monto en CLP
  const formatCLP = (amount_clp) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount_clp);
  };

  // Mapear códigos de tipo de pago a nombres legibles
  const getPaymentMethodName = (method) => {
    const methods = {
      webpay_credit: "Tarjeta de Crédito",
      webpay_debit: "Tarjeta de Débito",
      webpay_prepaid: "Tarjeta Prepago",
    };
    return methods[method] || method;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Head title={title} />

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Card Principal */}
          <div
            className={`bg-white rounded-lg shadow-lg border-2 ${borderColor} overflow-hidden animate-fadeIn`}
          >
            {/* Header con ícono */}
            <div className={`${bgColor} p-6 flex flex-col items-center`}>
              <Icon className={`w-16 h-16 ${iconColor} mb-4`} />
              <h1 className="text-2xl font-bold text-gray-900 text-center">
                {title}
              </h1>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4">
              {/* Mensaje principal */}
              <p className="text-center text-gray-700 text-lg">{message}</p>

              {/* Detalles del pago (solo si existe y fue exitoso) */}
              {payment && success && (
                <div className="mt-6 space-y-3 border-t border-gray-200 pt-4">
                  {/* Monto */}
                  {payment.amount_clp && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Monto:</span>
                      <span className="font-semibold text-gray-900 text-lg">
                        {formatCLP(payment.amount_clp)}
                      </span>
                    </div>
                  )}

                  {/* Paciente */}
                  {payment.patient?.full_name && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Paciente:</span>
                      <span className="font-medium text-gray-900">
                        {payment.patient.full_name}
                      </span>
                    </div>
                  )}

                  {/* Código de autorización */}
                  {payment.webpay_authorization_code && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Código de autorización:
                      </span>
                      <span className="font-mono text-gray-900">
                        {payment.webpay_authorization_code}
                      </span>
                    </div>
                  )}

                  {/* Método de pago */}
                  {payment.payment_method && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Método de pago:</span>
                      <span className="text-gray-900">
                        {getPaymentMethodName(payment.payment_method)}
                      </span>
                    </div>
                  )}

                  {/* Cuotas */}
                  {payment.webpay_installments &&
                    payment.webpay_installments > 1 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Cuotas:</span>
                        <span className="text-gray-900">
                          {payment.webpay_installments}x
                        </span>
                      </div>
                    )}

                  {/* Últimos 4 dígitos de tarjeta */}
                  {payment.webpay_card_detail?.card_number && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tarjeta:</span>
                      <span className="font-mono text-gray-900">
                        **** {payment.webpay_card_detail.card_number}
                      </span>
                    </div>
                  )}

                  {/* Fecha de transacción */}
                  {payment.webpay_transaction_date && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="text-gray-900">
                        {formatDate(payment.webpay_transaction_date)}
                      </span>
                    </div>
                  )}

                  {/* ID de pago */}
                  {payment.id && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">ID de pago:</span>
                      <span className="font-mono text-gray-600">
                        #{payment.id}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Mensaje de instrucciones */}
              <div
                className={`mt-6 p-4 ${alertBgColor} border ${alertBorderColor} rounded-lg`}
              >
                <p className={`text-sm ${alertTextColor} text-center`}>
                  {success ? (
                    <>✓ Recibirás un comprobante por correo electrónico</>
                  ) : (
                    <>
                      Si tienes problemas con el pago, por favor contacta a
                      soporte
                    </>
                  )}
                </p>
              </div>

              {/* Botón para cerrar */}
              <div className="mt-6">
                <button
                  onClick={() => router.get("/")}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Cerrar Ventana
                </button>
              </div>

              {/* Contador de auto-cierre (solo si es exitoso) */}
              {success && window.opener && (
                <p className="text-xs text-gray-500 text-center">
                  Esta ventana se cerrará automáticamente en 10 segundos
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Transacción procesada por Transbank Webpay Plus
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {import.meta.env.VITE_APP_NAME || "KineMobile"} ©{" "}
              {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </>
  );
}
