import { Head } from "@inertiajs/react";
import { CheckCircle2, Calendar, User, FileText } from "lucide-react";

export default function AlreadyPaid({ paymentLink }) {
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
      <Head title="Pago Realizado" />

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          {/* Icono de éxito */}
          <div className="text-center mb-8">
            <div className="bg-white rounded-full w-24 h-24 mx-auto flex items-center justify-center shadow-xl mb-6 animate-bounce-slow">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Este pago ya fue realizado
            </h1>
            <p className="text-lg text-gray-600">
              El link de pago ya fue utilizado exitosamente
            </p>
          </div>

          {/* Card de Información */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              {/* Detalles del Pago */}
              <div className="space-y-6">
                {/* Paciente */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
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
                <div className="flex items-start gap-3">
                  <div className="bg-indigo-100 rounded-full p-2 mt-1">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Concepto</p>
                    <p className="text-lg font-medium text-gray-900">
                      {paymentLink.description}
                    </p>
                  </div>
                </div>

                {/* Monto Pagado */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                  <p className="text-sm text-gray-600 mb-2">Monto pagado</p>
                  <p className="text-4xl font-bold text-green-700">
                    {formatCLP(paymentLink.amount)}
                  </p>
                </div>

                {/* Fecha de Pago */}
                {paymentLink.paid_at && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha de pago</p>
                      <p className="text-base font-medium text-gray-900">
                        {formatDate(paymentLink.paid_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mensaje Informativo */}
              <div className="mt-8 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-900 mb-1">
                      Pago confirmado
                    </p>
                    <p className="text-sm text-green-700">
                      Este pago fue procesado exitosamente. Si necesitas un
                      comprobante o tienes dudas, contacta a tu centro de
                      kinesiología.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón Portal */}
              <div className="mt-6">
                <a
                  href={route("patient.login")}
                  className="w-full block py-3 px-6 text-center rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Acceder a mi portal de paciente
                </a>
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
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
