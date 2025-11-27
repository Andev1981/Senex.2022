import { Head } from "@inertiajs/react";
import {
  CheckCircle,
  Download,
  CreditCard,
  User,
  Hash,
  Calendar,
} from "lucide-react";

export default function PaymentSuccess({
  payment,
  paymentLink,
  patientLoginUrl,
}) {
  const formatCLP = (amount) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <Head title="¡Pago Exitoso!" />

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Animación de éxito */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
              <div className="bg-white rounded-full w-28 h-28 flex items-center justify-center shadow-2xl relative">
                <CheckCircle className="w-20 h-20 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mt-6 mb-2">
              ¡Pago Exitoso!
            </h1>
            <p className="text-xl text-gray-600">
              Tu pago ha sido procesado correctamente
            </p>
          </div>

          {/* Card de Detalles */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
            {/* Monto Grande */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-12 text-center">
              <p className="text-white text-opacity-90 text-sm font-medium mb-2">
                Monto pagado
              </p>
              <p className="text-white text-6xl font-bold">
                {formatCLP(payment.amount)}
              </p>
            </div>

            {/* Detalles del Pago */}
            <div className="p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Detalles de la transacción
              </h2>

              <div className="space-y-4">
                {/* ID de Transacción */}
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      ID Transacción
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-gray-900">
                    {payment.id}
                  </span>
                </div>

                {/* Código de Autorización */}
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Código Autorización
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-green-700">
                    {payment.authorization_code}
                  </span>
                </div>

                {/* Tarjeta */}
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Tarjeta</span>
                  </div>
                  <span className="font-mono font-semibold text-gray-900">
                    **** {payment.card_number}
                  </span>
                </div>

                {/* Fecha */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Fecha</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {new Date().toLocaleDateString("es-CL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Concepto del Pago */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Concepto</p>
                <p className="font-medium text-gray-900">
                  {paymentLink.description}
                </p>
              </div>

              {/* Estado del Payment Link */}
              {paymentLink.status === "partially_paid" &&
                paymentLink.remaining_amount > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Pago parcial realizado
                    </p>
                    <p className="text-sm text-blue-700">
                      Monto restante:{" "}
                      <strong>{formatCLP(paymentLink.remaining_amount)}</strong>
                    </p>
                  </div>
                )}

              {/* Comprobante */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Descargar Comprobante
                </button>
              </div>

              {/* Mensaje de Confirmación */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Recibirás un comprobante de pago en tu email registrado
                </p>
              </div>
            </div>
          </div>

          {/* CTA Portal del Paciente */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Accede a tu Portal de Paciente
              </h3>
              <p className="text-gray-600 mb-6">
                Revisa tu historial de pagos, sesiones y más
              </p>
              <a
                href={patientLoginUrl}
                className="inline-block py-3 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                Ir a mi portal
              </a>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Si tienes dudas sobre este pago, contacta a tu centro de
              kinesiología
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
