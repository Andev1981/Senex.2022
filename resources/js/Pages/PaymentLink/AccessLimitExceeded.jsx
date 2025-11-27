import { Head } from "@inertiajs/react";
import { ShieldAlert, AlertTriangle, Mail } from "lucide-react";

export default function AccessLimitExceeded({ message }) {
  return (
    <>
      <Head title="Acceso Bloqueado" />

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-white rounded-full w-24 h-24 mx-auto flex items-center justify-center shadow-xl mb-6">
              <ShieldAlert className="w-16 h-16 text-orange-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Acceso Bloqueado
            </h1>
            <p className="text-lg text-gray-600">
              Este link ha excedido el límite de accesos permitidos
            </p>
          </div>

          {/* Card Principal */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              {/* Alerta */}
              <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-900 mb-1">
                      Límite de seguridad excedido
                    </p>
                    <p className="text-sm text-orange-700">
                      {message ||
                        "Este link ha sido accedido demasiadas veces por motivos de seguridad."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Explicación */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  ¿Por qué ocurre esto?
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Por seguridad, limitamos la cantidad de veces que se puede
                  acceder a un link de pago. Esto ayuda a proteger tu
                  información y prevenir fraudes.
                </p>
              </div>

              {/* Qué hacer */}
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  ¿Qué puedo hacer?
                </h3>
                <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                  <li>Contacta a tu centro de kinesiología</li>
                  <li>Solicita que te envíen un nuevo link de pago</li>
                  <li>El nuevo link llegará a tu email registrado</li>
                </ol>
              </div>

              {/* Info de contacto */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Solicita un nuevo link
                  </p>
                  <p className="text-sm text-gray-600">
                    Contacta a tu centro para que te envíen un nuevo link de
                    pago por email.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                ¿Necesitas ayuda inmediata?{" "}
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
