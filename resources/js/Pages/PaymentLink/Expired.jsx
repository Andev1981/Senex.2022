import { Head } from "@inertiajs/react";
import { Clock, AlertTriangle, Calendar } from "lucide-react";

export default function Expired({ paymentLink }) {
  const formatCLP = (amount) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Head title="Link Expirado" />

      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-white rounded-full w-24 h-24 mx-auto flex items-center justify-center shadow-xl mb-6">
              <Clock className="w-16 h-16 text-amber-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Este link ha expirado
            </h1>
            <p className="text-lg text-gray-600">
              El plazo para realizar este pago venció
            </p>
          </div>

          {/* Card Principal */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              {/* Alerta de expiración */}
              <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 mb-1">
                      Link de pago expirado
                    </p>
                    <p className="text-sm text-amber-700">
                      Este link de pago ya no está disponible. Por favor
                      contacta a tu centro de kinesiología para obtener un nuevo
                      link.
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalles */}
              <div className="space-y-4 mb-6">
                {/* Concepto */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Concepto</p>
                  <p className="text-lg font-medium text-gray-900">
                    {paymentLink.description}
                  </p>
                </div>

                {/* Monto */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Monto</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCLP(paymentLink.amount)}
                  </p>
                </div>

                {/* Fecha de expiración */}
                {paymentLink.expires_at && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-500">Expiró el</p>
                      <p className="text-base font-medium text-gray-900">
                        {formatDate(paymentLink.expires_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Instrucciones */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  ¿Qué puedo hacer?
                </h3>
                <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                  <li>Contacta a tu centro de kinesiología</li>
                  <li>Solicita un nuevo link de pago</li>
                  <li>Recibirás un nuevo email con el link actualizado</li>
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                ¿Necesitas ayuda?{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Contacta al centro
                </a>
              </p>
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
