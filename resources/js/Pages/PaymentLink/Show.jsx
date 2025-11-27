import { useState } from "react";
import { Head } from "@inertiajs/react";
import {
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  FileText,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";

export default function PaymentLinkShow({ paymentLink }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [partialAmount, setPartialAmount] = useState(
    paymentLink.allow_partial_payment
      ? paymentLink.minimum_amount
      : paymentLink.remaining_amount
  );

  /**
   * Formatear moneda CLP
   */
  const formatCLP = (amount) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Formatear fecha
   */
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Manejar pago
   */
  const handlePay = async () => {
    setProcessing(true);
    setError(null);

    try {
      const payload = paymentLink.allow_partial_payment
        ? { amount: partialAmount }
        : {};

      const response = await axios.post(
        route("payment-link.checkout", { token: paymentLink.token }),
        payload
      );

      // Crear formulario para redireccionar a Webpay
      const form = document.createElement("form");
      form.method = "POST";
      form.action = response.data.url;

      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "token_ws";
      input.value = response.data.token;

      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error("Error al iniciar pago:", err);
      setError(
        err.response?.data?.error ||
          "Error al procesar el pago. Por favor intenta nuevamente."
      );
      setProcessing(false);
    }
  };

  /**
   * Validar monto parcial
   */
  const isValidPartialAmount = () => {
    if (!paymentLink.allow_partial_payment) return true;
    return (
      partialAmount >= paymentLink.minimum_amount &&
      partialAmount <= paymentLink.remaining_amount
    );
  };

  return (
    <>
      <Head title={`Pagar - ${paymentLink.description}`} />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-white rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-lg mb-4">
              <CreditCard className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              KineMobile
            </h1>
            <p className="text-gray-600">Solicitud de Pago</p>
          </div>

          {/* Card Principal */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Detalles del Pago */}
            <div className="p-8">
              {/* Paciente */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="bg-blue-100 rounded-full p-3">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Paciente</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {paymentLink.patient_name}
                  </p>
                </div>
              </div>

              {/* Concepto */}
              <div className="mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-indigo-100 rounded-full p-2 mt-1">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Concepto</p>
                    <p className="text-lg font-medium text-gray-900">
                      {paymentLink.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progreso de Pago (si aplica) */}
              {paymentLink.allow_partial_payment &&
                paymentLink.paid_amount > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Progreso de pago
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        {paymentLink.payment_progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${paymentLink.payment_progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-600">
                      <span>Pagado: {formatCLP(paymentLink.paid_amount)}</span>
                      <span>
                        Restante: {formatCLP(paymentLink.remaining_amount)}
                      </span>
                    </div>
                  </div>
                )}

              {/* Monto */}
              {paymentLink.allow_partial_payment ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto a pagar
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={partialAmount}
                      onChange={(e) =>
                        setPartialAmount(parseInt(e.target.value) || 0)
                      }
                      min={paymentLink.minimum_amount}
                      max={paymentLink.remaining_amount}
                      className="w-full pl-12 pr-4 py-4 text-2xl font-bold text-center border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>Mínimo: {formatCLP(paymentLink.minimum_amount)}</span>
                    <span>
                      Máximo: {formatCLP(paymentLink.remaining_amount)}
                    </span>
                  </div>
                  {!isValidPartialAmount() && (
                    <p className="mt-2 text-sm text-red-600">
                      El monto debe estar entre{" "}
                      {formatCLP(paymentLink.minimum_amount)} y{" "}
                      {formatCLP(paymentLink.remaining_amount)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
                  <p className="text-sm text-gray-600 mb-2">Monto a pagar</p>
                  <p className="text-4xl font-bold text-green-700">
                    {formatCLP(paymentLink.remaining_amount)}
                  </p>
                </div>
              )}

              {/* Expiración */}
              {paymentLink.expires_at && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span>
                    Válido hasta:{" "}
                    <strong>{formatDate(paymentLink.expires_at)}</strong>
                  </span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-900 mb-1">
                        Error al procesar el pago
                      </p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón de Pago */}
              <button
                onClick={handlePay}
                disabled={processing || !isValidPartialAmount()}
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-lg text-white
                  transition-all duration-200 flex items-center justify-center gap-3
                  ${
                    processing || !isValidPartialAmount()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                  }
                `}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    Pagar con Webpay
                  </>
                )}
              </button>

              {/* Info de Seguridad */}
              <div className="mt-6 flex items-start gap-2 text-sm text-gray-500">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
                <p>
                  Pago seguro procesado por <strong>Transbank</strong>. Tus
                  datos están protegidos con encriptación de extremo a extremo.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                ¿Dudas sobre este pago?{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Contacta a tu centro de kinesiología
                </a>
              </p>
            </div>
          </div>

          {/* Métodos de Pago Aceptados */}
          <div className="mt-6 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">
              Métodos de pago aceptados
            </h3>
            <div className="flex justify-center items-center gap-4 flex-wrap">
              <div className="px-4 py-2 bg-gray-100 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  💳 Débito
                </span>
              </div>
              <div className="px-4 py-2 bg-gray-100 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  💳 Crédito
                </span>
              </div>
              <div className="px-4 py-2 bg-gray-100 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  💰 Prepago
                </span>
              </div>
            </div>
          </div>

          {/* Link al Portal */}
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
