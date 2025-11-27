import { Head } from "@inertiajs/react";
import {
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Phone,
} from "lucide-react";

export default function PaymentFailed({ message = "El pago fue rechazado" }) {
  const handleRetry = () => {
    window.history.back();
  };

  return (
    <>
      <Head title="Pago Rechazado" />

      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="bg-white rounded-full w-28 h-28 flex items-center justify-center shadow-2xl">
                <XCircle className="w-20 h-20 text-red-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mt-6 mb-2">
              Pago Rechazado
            </h1>
            <p className="text-xl text-gray-600">No pudimos procesar tu pago</p>
          </div>

          {/* Card Principal */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
            <div className="p-8">
              {/* Mensaje de Error */}
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-900 mb-1">
                      Error en la transacción
                    </p>
                    <p className="text-sm text-red-700">{message}</p>
                  </div>
                </div>
              </div>

              {/* Posibles Causas */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Posibles causas:
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>Fondos insuficientes en tu cuenta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>Tarjeta bloqueada o vencida</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>Límite de compra excedido</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>Datos de la tarjeta incorrectos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>Problemas de conexión durante el proceso</span>
                  </li>
                </ul>
              </div>

              {/* Qué hacer */}
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  ¿Qué puedo hacer?
                </h3>
                <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                  <li>Verifica que tu tarjeta esté activa y tenga fondos</li>
                  <li>Revisa los datos de tu tarjeta (número, CVV, fecha)</li>
                  <li>Intenta con otra tarjeta o método de pago</li>
                  <li>Contacta a tu banco si el problema persiste</li>
                </ol>
              </div>

              {/* Botones de Acción */}
              <div className="space-y-3">
                {/* Reintentar */}
                <button
                  onClick={handleRetry}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <RefreshCw className="w-5 h-5" />
                  Intentar Nuevamente
                </button>

                {/* Volver */}
                <button
                  onClick={() => window.history.back()}
                  className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </button>
              </div>

              {/* Contacto */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      ¿Necesitas ayuda?
                    </p>
                    <p className="text-sm text-gray-600">
                      Contacta a tu centro de kinesiología para resolver
                      cualquier problema con el pago.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-center">
              Métodos de pago alternativos
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Si el problema persiste, puedes pagar directamente en el centro
            </p>
            <div className="flex justify-center items-center gap-3 flex-wrap">
              <div className="px-4 py-2 bg-gray-100 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  💵 Efectivo
                </span>
              </div>
              <div className="px-4 py-2 bg-gray-100 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  💳 Débito
                </span>
              </div>
              <div className="px-4 py-2 bg-gray-100 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  🏦 Transferencia
                </span>
              </div>
            </div>
          </div>

          {/* Portal Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya eres paciente?{" "}
              <a
                href={route("patient.login")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Accede a tu portal
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
