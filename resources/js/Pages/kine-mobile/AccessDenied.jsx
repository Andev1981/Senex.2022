// resources/js/pages/KineMobile/AccessDenied.jsx
import React from "react";
import { Head, router } from "@inertiajs/react";
import { XCircle, ArrowLeft, Mail } from "lucide-react";

export default function AccessDenied() {
  return (
    <>
      <Head title="Acceso Denegado" />

      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="w-full max-w-md">
          <div className="p-8 text-center bg-white shadow-xl rounded-2xl">
            {/* Icon */}
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>

            {/* Title */}
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Acceso Denegado
            </h1>

            {/* Message */}
            <p className="mb-6 text-gray-600">
              Tu acceso al portal móvil de kinesiólogos está deshabilitado o tu
              cuenta no está activa.
            </p>

            {/* Reasons */}
            <div className="p-4 mb-6 text-left border border-red-200 rounded-lg bg-red-50">
              <p className="mb-2 text-sm font-semibold text-red-800">
                Posibles razones:
              </p>
              <ul className="space-y-1 text-sm text-red-700 list-disc list-inside">
                <li>Tu acceso móvil fue deshabilitado por el administrador</li>
                <li>Tu cuenta está suspendida o cancelada</li>
                <li>No tienes permisos de kinesiólogo</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() =>
                  (window.location.href = "mailto:soporte@tuempresa.cl")
                }
                className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-white transition-colors bg-teal-600 rounded-lg hover:bg-teal-700"
              >
                <Mail className="w-5 h-5" />
                Contactar Soporte
              </button>

              <button
                onClick={() => router.post(route("logout"))}
                className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                <ArrowLeft className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </div>

            {/* Support info */}
            <div className="pt-6 mt-6 text-sm text-gray-500 border-t border-gray-200">
              <p>¿Necesitas ayuda?</p>
              <p className="font-medium text-teal-600">soporte@tuempresa.cl</p>
              <p className="font-medium text-teal-600">+56 9 XXXX XXXX</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
