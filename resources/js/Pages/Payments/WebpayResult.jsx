import { Head, router } from "@inertiajs/react";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

/**
 * Componente para mostrar el resultado de un pago con Webpay
 *
 * Props:
 * - success: boolean - Si el pago fue exitoso
 * - message: string - Mensaje principal
 * - type: 'success' | 'failed' | 'cancelled' | 'error'
 * - payment: object - Datos del pago (opcional)
 * - error: string - Mensaje de error técnico (solo en desarrollo)
 */
export default function WebpayResult({
  success,
  message,
  type,
  payment,
  error,
}) {
  // Configuración visual según el tipo de resultado
  const config = {
    success: {
      icon: CheckCircle,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      title: "Pago Exitoso",
    },
    failed: {
      icon: XCircle,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      title: "Pago Rechazado",
    },
    cancelled: {
      icon: AlertCircle,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      title: "Pago Cancelado",
    },
    error: {
      icon: XCircle,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      title: "Error en el Pago",
    },
  };

  const current = config[type] || config.error;
  const Icon = current.icon;

  // Formatear monto en CLP
  const formatCLP = (amount) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);
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

  return (
    <>
      <Head title={current.title} />

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Card Principal */}
          <div
            className={`bg-white rounded-lg shadow-lg border-2 ${current.borderColor} overflow-hidden`}
          >
            {/* Header con ícono */}
            <div
              className={`${current.bgColor} p-6 flex flex-col items-center`}
            >
              <Icon className={`w-16 h-16 ${current.iconColor} mb-4`} />
              <h1 className="text-2xl font-bold text-gray-900 text-center">
                {current.title}
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
                  {payment.amount && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Monto:</span>
                      <span className="font-semibold text-gray-900 text-lg">
                        {formatCLP(payment.amount)}
                      </span>
                    </div>
                  )}

                  {/* Paciente */}
                  {payment.patient_name && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Paciente:</span>
                      <span className="font-medium text-gray-900">
                        {payment.patient_name}
                      </span>
                    </div>
                  )}

                  {/* Código de autorización */}
                  {payment.authorization_code && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Código de autorización:
                      </span>
                      <span className="font-mono text-gray-900">
                        {payment.authorization_code}
                      </span>
                    </div>
                  )}

                  {/* Método de pago */}
                  {payment.payment_type && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Método de pago:</span>
                      <span className="text-gray-900">
                        {getPaymentMethodName(payment.payment_type)}
                      </span>
                    </div>
                  )}

                  {/* Cuotas */}
                  {payment.installments && payment.installments > 1 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cuotas:</span>
                      <span className="text-gray-900">
                        {payment.installments}x
                      </span>
                    </div>
                  )}

                  {/* Últimos 4 dígitos de tarjeta */}
                  {payment.card_detail && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tarjeta:</span>
                      <span className="font-mono text-gray-900">
                        **** {payment.card_detail.card_number || "****"}
                      </span>
                    </div>
                  )}

                  {/* Fecha de transacción */}
                  {payment.transaction_date && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="text-gray-900">
                        {new Date(payment.transaction_date).toLocaleString(
                          "es-CL"
                        )}
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

              {/* Error técnico (solo en desarrollo) */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <p className="font-semibold mb-1">Error técnico:</p>
                  <p className="font-mono text-xs">{error}</p>
                </div>
              )}

              {/* Acciones */}
              <div className="mt-6 space-y-2">
                {success ? (
                  <>
                    {/* Botón principal: Ver detalle del pago */}
                    <a
                      href={`/payments/${payment?.id}`}
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
                    >
                      Ver Detalle del Pago
                    </a>

                    {/* Botón secundario: Volver al inicio */}
                    <button
                      onClick={() => router.get("/test/webpay")}
                      className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg text-center transition-colors"
                    >
                      Volver al Inicio
                    </button>
                  </>
                ) : (
                  <>
                    {/* Botón reintentar */}
                    <button
                      onClick={() => window.history.back()}
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
                    >
                      Reintentar Pago
                    </button>

                    {/* Botón volver */}
                    <button
                      onClick={() => router.get("/test/webpay")}
                      className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg text-center transition-colors"
                    >
                      Volver al Inicio
                    </button>
                  </>
                )}
              </div>

              {/* Mensaje de ayuda */}
              {!success && (
                <p className="text-sm text-gray-500 text-center mt-4">
                  Si tienes problemas con el pago, contacta a soporte.
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Transacción procesada por Transbank Webpay Plus
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
